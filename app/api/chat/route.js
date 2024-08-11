import { NextResponse } from 'next/server';
import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand, InvokeAgentCommand } from "@aws-sdk/client-bedrock-agent-runtime";

const agentId = process.env.AWS_AGENT_ID
const agentAliasId = process.env.AWS_AGENT_ALIAS_ID
const systemPrompt = 'You are a customer support agent to answer questions about the rent apartment at New York for users. Your response must be in Markdown format only. Ensure that all elements, including headings, paragraphs, bullet points, and code blocks, are properly separated by appropriate newlines. Each heading should be followed by a space before the two newlines and one space after the two newlines, and paragraphs should not be attached to headings or other Markdown elements; this means all elements are to be separeted by one space before the two newlines and one space after the two newlines except for bullet points which should be separated by a space before the newline and one space after the newline. The output should be fully compliant with Markdown standards, with proper spacing and formatting throughout.';
const knowledgeBaseId = process.env.AWS_BEDROCK_KNOWLEDGE_BASE_ID;
const modelArn = "arn:aws:bedrock:us-east-1::foundation-model/anthropic.claude-v2:1";



export async function POST(req) {
  console.log("Received request in backend");

  const bedrockAgentRuntimeClient = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION });
  const data = await req.json();
  const userMessage = data[data.length - 1].content;

  const input = `${systemPrompt}\nUser: ${userMessage}.\nAssistant: {{ your response here }}`;

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

  // const command = new RetrieveAndGenerateCommand(retrieveAndGenerateParams);

  const command = new InvokeAgentCommand({
    agentId,
    agentAliasId,
    sessionId: Math.floor(Math.random() * Math.pow(10, 10)), // replace with actual sessionId
    inputText: input,
  });

  try {
    let completion = "";
    console.log("Sending command to Bedrock", command);
    const response = await bedrockAgentRuntimeClient.send(command);

    if (response.completion === undefined) {
      throw new Error("Completion is undefined");
    }

    for await (let chunkEvent of response.completion) {
      const chunk = chunkEvent.chunk;
      const decodedResponse = new TextDecoder("utf-8").decode(chunk.bytes);
      completion += decodedResponse;
    }

    return NextResponse.json({ text: completion });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ text: "An error occurred" });
  }
  

  // try {
  //   const response = await bedrockAgentRuntimeClient.send(command);
  //   console.log("Received response from Bedrock:", response);

  //   const generatedText = response.output.text;
  //   const citations = response.citations;

  //   const responseObject = {
  //     text: generatedText,
  //     citations: citations.map(citation => ({
  //       text: citation.generatedResponsePart.textResponsePart.text,
  //       references: citation.retrievedReferences.map(ref => ({
  //         content: ref.content.text,
  //         location: ref.location
  //       }))
  //     }))
  //   };

  //   console.log("Prepared response object:", responseObject);

  //   const encoder = new TextEncoder();
  //   const stream = new ReadableStream({
  //     start(controller) {
  //       console.log("Starting stream");
  //       controller.enqueue(encoder.encode(JSON.stringify(responseObject)));
  //       console.log("Enqueued response");
  //       controller.close();
  //       console.log("Closed stream");
  //     }
  //   });

  //   console.log("Returning response");
  //   return new Response(stream, {
  //     headers: { 'Content-Type': 'application/json' }
  //   });
  // } catch (error) {
  //   console.error("Error in backend:", error);
  //   return new Response(JSON.stringify({ error: 'An error occurred' }), {
  //     status: 500,
  //     headers: { 'Content-Type': 'application/json' }
  //   });
  // }
    
}

