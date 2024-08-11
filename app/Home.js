'use client'
import { Box, Stack, Button, TextField } from "@mui/material";
import { useState } from "react";


export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi I'm a rental assistant for New York City rentals. How can I help you today?`
    }
  ])
  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    console.log("Sending message:", message);
    setMessage('');  // Clear the input field
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: 'Thinking...', citations: [] },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      const result = await reader.read();
      const chunk = decoder.decode(result.value);
      console.log("Received chunk:", chunk);

      const responseObject = JSON.parse(chunk);
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: responseObject.text,
          // citations: responseObject.citations,
        };
        return newMessages;
      });
    } catch (error) {
      console.error("Error in sendMessage:", error);
      setMessages((prevMessages) => {
        const newMessages = [...prevMessages];
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: 'Sorry, an error occurred while processing your request.',
          citations: [],
        };
        return newMessages;
      });
    }
  }

  return <Box
    width='100vw'
    height='100vh'
    display='flex'
    flexDirection='column'
    justifyContent='center'
    alignItems='center'
  >
    <Stack
      directon='column'
      width='600px'
      height='700px'
      border='1px solid black'
      p={2}
      spacing={2}
    >
      <Stack
        direction='column'
        spacing={2}
        flexGrow={1}
        overflow='auto'
        maxHeight='100%'
      >
        {
          messages.map((message, index) => (
            <Box key = {index} display='flex' justifyContent={
              message.role==='assistant'?'flex-start':'flex-end'
            }>
              <Box
                bgcolor={
                  message.role==='assistant'?'primary.main':'secondary.main'
                }
                color='white'
                borderRadius={16}
                p={3}
              >
                {message.content}
                {message.citations && (
                  <Box>
                    {message.citations.map((citation, index) => (
                      <Box key={index}>
                        <Box>{citation.text}</Box>
                        {citation.references.map((ref, index) => (
                          <Box key={index}>
                            <Box>Content: {ref.content}</Box>
                            <Box>Location: {JSON.stringify(ref.location)}</Box>
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          ))
        }
      </Stack>
      <Stack direction='row' spacing={2}>
        <TextField
          label='message'
          fullWidth
          value={message}
          onChange={(e)=>setMessage(e.target.value)}
        />
        <Button variant="contained" onClick={sendMessage}>Send</Button>
      </Stack>
    </Stack>
  </Box>
}
