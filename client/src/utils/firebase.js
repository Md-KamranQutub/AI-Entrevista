import { initializeApp } from "firebase/app";
import {getAuth , GoogleAuthProvider} from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAn0L7hFNCDETGdmzy-Iy-akZXqrB9vITQ",
  authDomain: "ai-entrevista.firebaseapp.com",
  projectId: "ai-entrevista",
  storageBucket: "ai-entrevista.firebasestorage.app",
  messagingSenderId: "18417708758",
  appId: "1:18417708758:web:54d953990c25b450ef2377"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();
export { auth , provider }