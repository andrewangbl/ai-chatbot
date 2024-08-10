// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCAG0mwDIs1SIpUFVvs5zMhBzuHVAEzt9o",
  authDomain: "chatbot-855e5.firebaseapp.com",
  projectId: "chatbot-855e5",
  storageBucket: "chatbot-855e5.appspot.com",
  messagingSenderId: "1032610048130",
  appId: "1:1032610048130:web:e2503bece1dc85469eac9b",
  measurementId: "G-WWPDTNVZ0K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firebase Analytics if you need it
export const analytics = typeof window !== "undefined" && getAnalytics(app);
