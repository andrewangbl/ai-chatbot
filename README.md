# NYC Rental Assistant Chatbot
This project is a Next.js-based chatbot application designed to assist users with New York City rental inquiries. It leverages AWS Bedrock for natural language processing and integrates with various AWS services for authentication, file storage, and database management.

## Features
1. User Authentication: Sign up and sign in functionality using AWS DynamoDB for user management.
2. Chat Interface: A responsive chat interface for users to interact with the rental assistant.
3. File Upload: Ability to upload files during the conversation, which are stored in AWS S3.
4. Real-time Responses: Utilizes AWS Bedrock for generating context-aware responses.

## How It Works

### User Authentication:
Users can sign up or sign in using their email and password.
User credentials are securely stored in AWS DynamoDB.
### Chat Interface:
The main chat interface is implemented in the Home component: It uses Material-UI components for a clean and responsive design.
### Message Handling:
When a user sends a message, it's processed by the sendMessage function: This function sends the message to the backend API and handles the response.
### Backend Processing:
The chat API uses AWS Bedrock Agent Runtime to process the user's input and generate responses.
