import bcrypt from 'bcryptjs';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import { v4 as uuidv4 } from 'uuid';

const awsConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

const s3Client = new S3Client(awsConfig);
const dynamoDbClient = new DynamoDBClient(awsConfig);
const ddbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);
const bedrockAgentRuntimeClient = new BedrockAgentRuntimeClient(awsConfig);

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
      files: [],
    },
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
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
    const { Item } = await ddbDocClient.send(new GetCommand(params));
    if (!Item) {
      return { success: false, message: 'User not found.' };
    }

    const isPasswordValid = await bcrypt.compare(password, Item.passwordHash);
    if (!isPasswordValid) {
      return { success: false, message: 'Invalid password.' };
    }

    return { success: true, message: 'Authenticated successfully.', user: Item };
  } catch (error) {
    console.error('Error signing in:', error);
    return { success: false, message: 'Failed to sign in.' };
  }
};

export const signOut = async () => {
  localStorage.removeItem('email');
}

export const checkUserAuthenticated = async (email) => {
  const params = {
    TableName: 'Users',
    Key: {
      userId: email,
    },
  };

  try {
    const { Item } = await ddbDocClient.send(new GetCommand(params));
    return Item ? { success: true, user: Item } : { success: false };
  } catch (error) {
    console.error('Error checking user authentication:', error);
    return { success: false };
  }
};

// export const uploadFile = async (file, email) => {
//   const ext = file?.name.split(".").at(-1);
//   const uid = uuidv4().replace(/-/g, "");
//   const fileName = `${uid}${ext ? "." + ext : ""}`;

//   try {
//     // Upload file to S3
//     const uploadToS3 = new PutObjectCommand({
//       Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME,
//       Key: fileName,
//       Body: file,
//     });
//     await s3Client.send(uploadToS3);

//     // Upload file to DynamoDB
//     const params = {
//       TableName: 'Users',
//       Key: {
//         userId: email,
//       },
//       UpdateExpression: 'SET #f = list_append(if_not_exists(#f, :empty_list), :new_file)',
//       ExpressionAttributeNames: {
//         '#f': 'files',
//       },
//       ExpressionAttributeValues: {
//         ':empty_list': [],
//         ':new_file': [fileName],
//       },
//     };
//     await ddbDocClient.send(new UpdateCommand(params));
//   } catch (error) {
//     console.error(error);
//   }
// };
