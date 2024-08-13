export const maxDuration = 60;

import { NextResponse } from 'next/server';
import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime";

const knowledgeBaseId = process.env.AWS_BEDROCK_KNOWLEDGE_BASE_ID;
const modelArn = "anthropic.claude-3-sonnet-20240229-v1:0";

export async function POST(req) {
  console.log("Received request in backend");

  const client = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION });
  const data = await req.json();
  const messages = data.messages;
  const language = data.language;

  const systemPrompt = language === 'zh'
    ? '你是一个了解纽约市租房法律和流程的租房代理。请用中文回答。'
    : 'You are a renting agent who knows property laws and NYC renting process. Please answer in English.';

  const conversationContext = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

  const retrieveAndGenerateParams = {
    input: {
      text: `${systemPrompt}\n\nRecent conversation context:\n${conversationContext}\n\nPlease provide a response to the last user message, considering the recent context.`
    },
    retrieveAndGenerateConfiguration: {
      type: 'KNOWLEDGE_BASE',
      knowledgeBaseConfiguration: {
        knowledgeBaseId: knowledgeBaseId,
        modelArn: modelArn,
        retrievalConfiguration: {
          vectorSearchConfiguration: {
            numberOfResults: 5,
            overrideSearchType: "SEMANTIC"
          }
        },
        generationConfiguration: {
          promptTemplate: {
            textPromptTemplate: `${systemPrompt}\n\nThis is data you're given about the NYC renting knowledge base: $search_results$ Be concise and guide user to asked details when user asked simple and general questions. But when user asked specific questions, provide detailed answer. When user asked questions that are not related to renting, politely tell them that you are a renting agent and you only answer questions related to renting.`
          },
          inferenceConfig: {
            textInferenceConfig: {
              temperature: 0.7,
              topP: 0.9,
              maxTokens: 512
            }
          }
        },
        orchestrationConfiguration: {
          queryTransformationConfiguration: {
            type: "QUERY_DECOMPOSITION"
          }
        }
      }
    }
  };

  const command = new RetrieveAndGenerateCommand(retrieveAndGenerateParams);

  try {
    console.log("Sending command to Bedrock", command);
    const response = await client.send(command);

    if (!response.output || !response.output.text) {
      throw new Error("No output text in response");
    }

    const responseText = response.output.text;
    // const citations = response.citations || [];

    return NextResponse.json({ text: responseText });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: `Error: ${err.message || 'An unknown error occurred'}` }, { status: 500 });
  }
}
