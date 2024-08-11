'use client';

import { useState } from 'react';
import { signUpUser } from '../../lib/auth'; // Adjust the path if necessary
import { TextField, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    const response = await signUpUser(email, password);
    localStorage.setItem('email', email);
    if (response.success) {
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
      <Button variant="contained" onClick={handleSignUp} sx={{ mt: 2 }}>
        Sign Up
      </Button>
      <Button onClick={() => router.push('/signin')} sx={{ mt: 2 }}>
        Already have an account? Sign In
      </Button>
    </Box>
  );
}
