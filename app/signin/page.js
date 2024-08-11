'use client';

import { useState, useEffect } from 'react';
import { signInUser } from '../../lib/auth'; // Adjust the path if necessary
import { TextField, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      router.push('/');
    }
  }, []);

  const handleSignIn = async () => {
    const response = await signInUser(email, password);
    if (response.success) {
      console.log('Sign-in successful, storing email in localStorage...');
      localStorage.setItem('userEmail', email); // Store the email in localStorage
      router.push('/');
    } else {
      setError(response.message);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh" bgcolor="white" >
      <TextField
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
      />
      {error && <Box color="red" mt={2}>{error}</Box>}
      <Button variant="contained" onClick={handleSignIn} sx={{ mt: 2 }}>
        Sign In
      </Button>
      <Button onClick={() => router.push('/signup')} sx={{ mt: 2 }}>
        Don't have an account? Sign Up
      </Button>
    </Box>
  );
}
