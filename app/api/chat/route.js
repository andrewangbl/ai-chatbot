import { NextResponse } from 'next/server';
import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime";

const systemPrompt = 'You are an AI-powered customer support agent to answer questions about the rent apartment at New York.';
const knowledgeBaseId = process.env.AWS_BEDROCK_KNOWLEDGE_BASE_ID;
const modelArn = process.env.AWS_BEDROCK_MODEL_ARN;

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
        modelArn: modelArn
      }
    }
  };

  const command = new RetrieveAndGenerateCommand(retrieveAndGenerateParams);

  try {
    const response = await bedrockAgentRuntimeClient.send(command);
    const generatedText = response.output.text;

    // Create a ReadableStream to stream the response
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(generatedText));
        controller.close();
      }
    });

    return new Response(stream);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
}
