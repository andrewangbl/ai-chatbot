'use client'
import { Box, Stack, Button, TextField } from "@mui/material";
import { useState } from "react";


export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi I'm a law firm assistant. How can I help you today?`
    }
  ])
  const [message, setMessage] = useState('')

  const sendMessage = async () => {
    setMessage('')  // Clear the input field
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },  // Add the user's message to the chat
      { role: 'assistant', content: '', citations: [] },  // Add a placeholder for the assistant's response
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: message }] }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const data = JSON.parse(chunk);

        setMessages((prevMessages) => {
          const newMessages = [...prevMessages];
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: data.text,
            citations: data.citations,
          };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'An error occurred while processing your request.' },
      ]);
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
