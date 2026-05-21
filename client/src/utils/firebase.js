import { initializeApp } from "firebase/app";
import {getAuth , GoogleAuthProvider} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
   authDomain: "ai-interview-43f72.firebaseapp.com",
  projectId: "ai-interview-43f72",
  storageBucket: "ai-interview-43f72.firebasestorage.app",
  messagingSenderId: "303731558590",
  appId: "1:303731558590:web:6aace962a6ba9e224976ef",
  measurementId: "G-7K7FVR2151"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth , provider }