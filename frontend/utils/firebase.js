import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "multiagent-6b886.firebaseapp.com",
  projectId: "multiagent-6b886",
  storageBucket: "multiagent-6b886.firebasestorage.app",
  messagingSenderId: "825226997760",
  appId: "1:825226997760:web:758a41239e542d1239e8e5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();