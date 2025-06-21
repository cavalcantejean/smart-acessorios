// src/lib/firebase-client.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore'; // Added Firestore for completeness, as original firebase.ts had it
import { getAnalytics, type Analytics } from 'firebase/analytics';

// Ensure environment variables are prefixed with NEXT_PUBLIC_ for client-side access
const firebaseConfig = {
  apiKey: "AIzaSyA9aAfqBDR1EoNTlP32uGT_sjDy5QYwLos",
  authDomain: "smartastico.firebaseapp.com",
  projectId: "smartastico",
  storageBucket: "smartastico.firebasestorage.app",
  messagingSenderId: "991460622804",
  appId: "1:991460622804:web:adb47d2b3dc61c32ca5641",
  measurementId: "G-9H87XSG5DN"
};

// Initialize Firebase on the client
let app: FirebaseApp;
let auth: Auth;
let db: Firestore; // Added Firestore instance
let analytics: Analytics;

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
  analytics = getAnalytics(app);
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
  // @ts-ignore
  analytics = undefined;
  console.warn("Firebase client SDK (firebase-client.ts) is being imported on the server. This is generally not recommended. Ensure it's only used in client components or 'use server' modules.");
}

export { app, auth, db, analytics }; // Export db as well
