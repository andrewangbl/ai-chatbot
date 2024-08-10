'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase'; // Adjust the path if necessary
import { TextField, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (error) {
      setError(error.message);
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
