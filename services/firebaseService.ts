
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCS-AtUQuJDy0fTc6-ecXYRjQZ4D1sZJcc",
  authDomain: "mentalwellnessai-cf684.firebaseapp.com",
  databaseURL: "https://mentalwellnessai-cf684-default-rtdb.firebaseio.com",
  projectId: "mentalwellnessai-cf684",
  storageBucket: "mentalwellnessai-cf684.firebasestorage.app",
  messagingSenderId: "964649666556",
  appId: "1:964649666556:web:3ffc7fbfbec27c8a60d479"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
