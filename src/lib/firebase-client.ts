// src/lib/firebase-client.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore'; // Added Firestore for completeness, as original firebase.ts had it

// Ensure environment variables are prefixed with NEXT_PUBLIC_ for client-side access
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId is optional for client SDK, include if used
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase on the client
let app: FirebaseApp;
let auth: Auth;
let db: Firestore; // Added Firestore instance

if (typeof window !== 'undefined') { // Ensure this only runs on the client
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
    console.log("Firebase client app initialized.");
  } else {
    app = getApp();
    console.log("Firebase client app already initialized, getting existing app.");
  }
  auth = getAuth(app);
  db = getFirestore(app); // Initialize Firestore
} else {
  // Handle server-side rendering or cases where window is not defined,
  // though these exports are primarily for client-side use.
  // Depending on usage, you might not need to initialize here or could throw an error.
  // For now, leave them potentially uninitialized if not in client context.
  // This scenario should ideally be avoided by only using this module on the client.
  // @ts-ignore
  app = undefined;
  // @ts-ignore
  auth = undefined;
  // @ts-ignore
  db = undefined;
  console.warn("Firebase client SDK (firebase-client.ts) is being imported on the server. This is generally not recommended. Ensure it's only used in client components or 'use client' modules.");
}


export { app, auth, db }; // Export db as well

