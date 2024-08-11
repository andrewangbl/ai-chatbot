'use client';

import { useState, useEffect } from 'react';
import { checkUserAuthenticated } from '../lib/auth'; // Adjust the path if necessary
import { useRouter } from 'next/navigation';
import Home from './Home';

export default function ProtectedPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const email = localStorage.getItem('email'); // Use localStorage to store and retrieve the user's email
      console.log('Checking authentication for email:', email);

      if (!email) {
        console.log('No email found in localStorage, redirecting to sign-in...');
        router.push('/signin');
        return;
      }

      const response = await checkUserAuthenticated(email);
      console.log('Authentication check response:', response);

      if (!response.success) {
        console.log('Authentication failed, redirecting to sign-in...');
        router.push('/signin');
      } else {
        console.log('Authentication succeeded, loading home page...');
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading message while checking authentication
  }

  return <Home />; // Render the Home component if authenticated
}
