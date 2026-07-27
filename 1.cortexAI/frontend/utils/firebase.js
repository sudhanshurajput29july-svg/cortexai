// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAr6O7UVX22GfWdIMpWiVcPCq4aburgp9c",
  authDomain: "cortex-bbc34.firebaseapp.com",
  projectId: "cortex-bbc34",
  storageBucket: "cortex-bbc34.firebasestorage.app",
  messagingSenderId: "484461577619",
  appId: "1:484461577619:web:41fdd520d80c56036dd466",
  measurementId: "G-V2SFG22Q8X"
};

// Initialize Firebase cleanly for Vite HMR
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});