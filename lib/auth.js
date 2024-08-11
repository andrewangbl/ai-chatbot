import bcrypt from 'bcryptjs';
import { S3Client } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime";

// Configure AWS SDK with credentials and region
const s3Client = new S3Client({ region: process.env.AWS_REGION });
const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);
const bedrockAgentRuntimeClient = new BedrockAgentRuntimeClient({ region: process.env.AWS_REGION });
console.log('AWS Region:', process.env.AWS_REGION);
console.log('AWS Access Key:', process.env.AWS_ACCESS_KEY_ID ? 'Loaded' : 'Not Loaded');
console.log('AWS Secret Access Key:', process.env.AWS_SECRET_ACCESS_KEY ? 'Loaded' : 'Not Loaded');


export const signUpUser = async (email, password) => {
  const passwordHash = await bcrypt.hash(password, 10);
  const userId = email;
  const createdAt = new Date().toISOString();

  const params = {
    TableName: 'Users',
    Item: {
      userId,
      email,
      passwordHash,
      createdAt,
    },
  };

  try {
    await dynamoDb.put(params).promise();
    return { success: true, message: 'User created successfully.' };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, message: 'Failed to create user.' };
  }
};

export const signInUser = async (email, password) => {
  const params = {
    TableName: 'Users',
    Key: {
      userId: email,
    },
  };

  try {
    const result = await dynamoDb.get(params).promise();
    if (!result.Item) {
      return { success: false, message: 'User not found.' };
    }

    const isPasswordValid = await bcrypt.compare(password, result.Item.passwordHash);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid password.' };
    }

    return { success: true, message: 'Authenticated successfully.', user: result.Item };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, message: 'Failed to sign in.' };
  }
};

export const checkUserAuthenticated = async (email) => {
  const params = {
    TableName: 'Users',
    Key: {
      userId: email,
    },
  };

  try {
    const result = await dynamoDb.get(params).promise();
    return result.Item ? { success: true, user: result.Item } : { success: false };
  } catch (error) {
    console.error('Error checking user authentication:', error);
    return { success: false };
  }
};
