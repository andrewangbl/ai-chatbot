import { NextResponse } from 'next/server';
import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime";

const systemPrompt = 'You are an AI-powered customer support agent to answer questions about the rent apartment at New York.';
const knowledgeBaseId = process.env.AWS_BEDROCK_KNOWLEDGE_BASE_ID;
const modelArn = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-v2:1";

export async function POST(req) {
  console.log("Received request in backend");

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
    console.log("Received response from Bedrock:", response);

    const generatedText = response.output.text;
    const citations = response.citations;

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

    console.log("Prepared response object:", responseObject);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        console.log("Starting stream");
        controller.enqueue(encoder.encode(JSON.stringify(responseObject)));
        console.log("Enqueued response");
        controller.close();
        console.log("Closed stream");
      }
    });

    console.log("Returning response");
    return new Response(stream, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Error in backend:", error);
    return new Response(JSON.stringify({ error: 'An error occurred' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

