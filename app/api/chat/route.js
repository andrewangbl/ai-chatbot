import { NextResponse } from 'next/server';
import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime";

const systemPrompt = 'You are an AI-powered customer support agent to answer questions about the rent apartment at New York.';
const knowledgeBaseId = process.env.AWS_BEDROCK_KNOWLEDGE_BASE_ID;
const modelArn = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-v2:1";

export async function POST(req) {
  const bedrockAgentRuntimeClient = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION });
  const data = await req.json();
  const userMessage = data[data.length - 1].content;

  const input = `${systemPrompt}\n\nUser: ${userMessage}\nAssistant:`;

  const retrieveAndGenerateParams = {
    input: {
      text: input
    },
    retrieveAndGenerateConfiguration: {
      type: 'KNOWLEDGE_BASE',
      knowledgeBaseConfiguration: {
        knowledgeBaseId: knowledgeBaseId,
        modelArn: modelArn,
        retrievalConfiguration: {
          vectorSearchConfiguration: {
            numberOfResults: 5,
          }
        },
        generationConfiguration: {
          temperature: 0.7,
          topP: 0.9,
          maxTokenCount: 512
        }
      }
    }
  };

  const command = new RetrieveAndGenerateCommand(retrieveAndGenerateParams);

  try {
    const response = await bedrockAgentRuntimeClient.send(command);
    const generatedText = response.output.text;
    const citations = response.citations;

    // Create a response object with generated text and citations
    const responseObject = {
      text: generatedText,
      citations: citations.map(citation => ({
        text: citation.generatedResponsePart.textResponsePart.text,
        references: citation.retrievedReferences.map(ref => ({
          content: ref.content.text,
          location: ref.location
        }))
      }))
    };

    // Create a ReadableStream to stream the response
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(JSON.stringify(responseObject)));
        controller.close();
      }
    });

    return new Response(stream, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
