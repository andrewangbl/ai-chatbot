'use client'
import { Box, Stack, Button, TextField, IconButton, Select, MenuItem } from "@mui/material";
import { useState, useEffect } from "react";
import markdownit from 'markdown-it'
import Markdown from 'react-markdown'
import { AttachFile, Send, Delete } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import { uploadFile, signOut } from "@/lib/auth";

export default function Home() {
  const md = markdownit({
    breaks: true,
    html: true,
    linkify: true,
    typographer: true
  })
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('')
  const [file, setFile] = useState(null)
  const router = useRouter();
  const theme = useTheme();
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const initialMessage = language === 'zh'
      ? '你好，我是纽约市租房助手。今天我能为您提供什么帮助？'
      : "Hi, I'm a rental assistant for New York City rentals. How can I help you today?";

    setMessages([
      {
        role: 'assistant',
        content: initialMessage
      }
    ]);
  }, [language]);

  const sendMessage = async (e) => {
    e.preventDefault();
    console.log("Sending message:", message);
    setMessage('');  // Clear the input field
    setFile(null)
    const newMessage = { role: 'user', content: message };
    setMessages((prevMessages) => [
      ...prevMessages,
      newMessage,
      { role: 'assistant', content: 'Searching...'},
    ]);

    try {
      // Upload file to S3
      // const email = localStorage.getItem('email')
      // await uploadFile(file, email)

      // Sliding Window Approach:Get the last 3 messages including the new one (or fewer if there aren't 5 yet)
      const recentMessages = [...messages.slice(-2), newMessage].filter(Boolean);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: recentMessages,
          language: language,
        }),
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
          // citations: [],
        };
        return newMessages;
      });
    }
  }
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/signin');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return <Box
    width='100vw'
    height='100vh'
    display='flex'
    flexDirection='column'
    justifyContent='center'
    alignItems='center'
    bgcolor={theme.palette.background.default}
  >
    <Stack direction="row" spacing={2} sx={{ position: 'absolute', top: 16, right: 16 }}>
      <Select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        size="small"
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="zh">Chinese</MenuItem>
      </Select>
      <Button
        variant="contained"
        color="secondary"
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </Stack>
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
                  message.role==='assistant'?'primary.main':'secondary.light'
                }
                color='white'
                borderRadius={16}
                p={3}
                px={4}
              >
                <Markdown>{message.content}</Markdown>
                {/* {message.citations && (
                  <Box>
                    {message.citations.map((citation, index) => (
                      <Box key={index}>
                        <Box>{md.render(citation.text)}</Box>
                        {citation.references.map((ref, index) => (
                          <Box key={index}>
                            <Box>Content: {ref.content}</Box>
                            <Box>Location: {JSON.stringify(ref.location)}</Box>
                          </Box>
                        ))}
                      </Box>
                    ))}
                  </Box>
                )} */}
              </Box>
            </Box>
          ))
        }
      </Stack>
      <form onSubmit={sendMessage}>
        <Stack direction='row' spacing={2}>
          <TextField
            multiline
            label='Your Message'
            autoComplete='off'
            fullWidth
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            sx={{
              '& .MuiInputBase-root': {
                minHeight: '50px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              },
              '& .MuiInputBase-input': {
                flexGrow: 1,
                overflow: 'auto',
              },
            }}
          />
          <Button variant="contained" color="primary" type="submit">
            <Send />
          </Button>
        </Stack>
      </form>
    </Stack>
  </Box>
}
