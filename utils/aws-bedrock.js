import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

export const bedrockRuntimeClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});
