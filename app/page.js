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
      const email = localStorage.getItem('email');
      console.log('Checking authentication for email:', email);

      if (!email) {
        console.log('No email found in localStorage, redirecting to sign-in...');
        router.push('/signin');
        return;
      }

      try {
        const response = await checkUserAuthenticated(email);
        console.log('Authentication check response:', response);

        if (!response.success) {
          if (response.error) {
            console.error('Authentication error:', response.error);
          }
          console.log('Authentication failed, redirecting to sign-in...');
          localStorage.removeItem('email'); // Clear the email from localStorage
          router.push('/signin');
        } else {
          console.log('Authentication succeeded, loading home page...');
          setLoading(false);
        }
      } catch (error) {
        console.error('Unexpected error during authentication check:', error);
        localStorage.removeItem('email');
        router.push('/signin');
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>; // Show a loading message while checking authentication
  }

  return <Home />; // Render the Home component if authenticated
}
