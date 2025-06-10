
// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth"; // Import Firebase Auth

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXVzd3bIG1cNsMZ4nPElKkuu_vE9YS-Ys",
  authDomain: "smart-acessorios.firebaseapp.com",
  projectId: "smart-acessorios",
  storageBucket: "smart-acessorios.firebasestorage.app",
  messagingSenderId: "782394541540",
  appId: "1:782394541540:web:942c2d58693c497e9573f1",
  measurementId: "G-ECBEQKZV53"
};

// Initialize Firebase
let app: FirebaseApp;
let db: Firestore;
let auth: Auth; // Declare Auth instance

try {
  console.log("Attempting Firebase initialization...");
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase app initialized successfully in firebase.ts.");
  } else {
    app = getApp();
    console.log("Firebase app already initialized, getting existing app in firebase.ts.");
  }

  db = getFirestore(app);
  auth = getAuth(app); // Initialize Auth

  if (db) {
    console.log("Firestore 'db' instance obtained successfully in firebase.ts.");
  } else {
    console.error("!!! Critical Error: Firestore 'db' instance is NULL or UNDEFINED after getFirestore(app) in firebase.ts !!!");
  }
  if (auth) {
    console.log("Firebase Auth 'auth' instance obtained successfully in firebase.ts.");
  } else {
    console.error("!!! Critical Error: Firebase Auth 'auth' instance is NULL or UNDEFINED after getAuth(app) in firebase.ts !!!");
  }

} catch (error) {
  console.error("!!! Firebase/Firestore/Auth Initialization Error in firebase.ts !!!");
  if (error instanceof Error) {
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);
  } else {
    console.error("Raw Error Object during Firebase init in firebase.ts:", error);
  }
}

export { app, db, auth }; // Export auth
