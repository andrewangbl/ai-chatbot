import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { BedrockClient } from "@aws-sdk/client-bedrock";

export const bedrockRuntimeClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION,
});

export const bedrockClient = new BedrockClient({
  region: process.env.AWS_REGION,
});
