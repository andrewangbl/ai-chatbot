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

    // Send the message to the server
    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    }).then(async (res) => {
      const reader = res.body.getReader()  // Get a reader to read the response body
      const decoder = new TextDecoder()  // Create a decoder to decode the response text

      let result = ''
      // Function to process the text from the response
      return reader.read().then(function processText({ done, value }) {
        if (done) {
          const responseObject = JSON.parse(result)
          setMessages((messages) => {
            let lastMessage = messages[messages.length - 1]  // Get the last message (assistant's placeholder)
            let otherMessages = messages.slice(0, messages.length - 1)  // Get all other messages
            return [
              ...otherMessages,
              { ...lastMessage, content: responseObject.text, citations: responseObject.citations },
            ]
          })
          return
        }
        result += decoder.decode(value || new Uint8Array(), { stream: true })  // Decode the text
        return reader.read().then(processText)  // Continue reading the next chunk of the response
      })
    })
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
