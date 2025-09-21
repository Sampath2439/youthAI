
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAnKuY5iv77yFQG04BrMQc3BRiKjgqaSuI",
  authDomain: "mentalwelllnessai.firebaseapp.com",
  projectId: "mentalwelllnessai",
  storageBucket: "mentalwelllnessai.firebasestorage.app",
  messagingSenderId: "1099499604519",
  appId: "1:1099499604519:web:8fa555f9bdf51ef36d5c02"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
