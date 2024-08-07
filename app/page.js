"use client"
import { Box, Button, Stack, TextField } from "@mui/material";
import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am the Headstarter AI assistant. How can I help you today?' },
  ]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!message.trim()) return;  // Don't send empty messages
  
    setMessage('')
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])
  
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })
  
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })

        setMessages((messages) => {
          let lastMessage = messages[messages.length - 1]
          let otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })

        // Add a delay
        await new Promise(resolve => setTimeout(resolve, 50)) 
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ])
    }
  }

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      bgcolor="#333"
    >
      <Stack
        direction={"column"}
        width="500px"
        height="700px"
        border="2px solid black"
        p={2}
        bgcolor="#000"
        borderRadius={10}
      >
        <Stack
          direction={"column"}
          spacing={2}
          flexGrow={1}
          overflow="auto"
          p={2}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              marginBottom="20px"
            >
              <Box
                bgcolor={message.role === 'assistant' ? '#009193' : 'white'}
                color="black"
                borderRadius={10}
                p={3.5}
              >
                {message.content}
              </Box>
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={"row"} spacing={2} mt={2}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') sendMessage();
            }}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#009193', // Set the outline color
                },
                '&:hover fieldset': {
                  borderColor: '#009193', // Set the outline color on hover
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#009193', // Set the outline color when focused
                },
              },
              '& .MuiInputLabel-root': {
                color: 'white', // Set the label color to white
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: 'white', // Set the label color to white when focused
              },
              '& .MuiInputBase-input': {
                color: 'white', // Set the input text color to white
              },
            }}
          />
          <Button variant="contained" onClick={sendMessage} disabled={isLoading}
          sx={{ bgcolor: "#009193", color: "black" }}
          >
            {isLoading ? 'Sending...' : 'Send'}
          
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
