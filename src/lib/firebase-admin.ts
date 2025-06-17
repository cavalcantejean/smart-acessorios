// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app'; // Correct import for getApps for Admin SDK
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import type { Auth as AdminAuth } from 'firebase-admin/auth';

// These environment variables are server-side only and should be set in your
// Cloud Run service environment (e.g., via secrets).
// DO NOT prefix them with NEXT_PUBLIC_.
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID, // Or NEXT_PUBLIC_FIREBASE_PROJECT_ID if that's what's set for admin
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

let adminDb: AdminFirestore;
let adminAuth: AdminAuth;

// Check if Firebase Admin SDK has already been initialized
if (getApps().length === 0) {
  // Check if all necessary service account details are present
  if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
    console.log('Initializing Firebase Admin SDK with service account...');
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error('Firebase Admin SDK initialization error:', error.message);
      console.error('Service Account details used (check if they are correctly loaded by the environment):');
      console.error(` - projectId: ${serviceAccount.projectId ? 'Set' : 'NOT SET'}`);
      console.error(` - clientEmail: ${serviceAccount.clientEmail ? 'Set' : 'NOT SET'}`);
      console.error(` - privateKey: ${serviceAccount.privateKey ? 'Set (length: ' + serviceAccount.privateKey.length + ')' : 'NOT SET'}`);
      // To avoid making adminDb/adminAuth undefined and then having runtime errors,
      // it might be better to throw here or ensure the app cannot proceed without admin services.
      // However, for now, matching the user's proposed structure.
    }
  } else {
    console.warn('Firebase Admin SDK: Missing required service account environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY). SDK will not be initialized.');
  }
} else {
  console.log('Firebase Admin SDK already initialized. Using existing app.');
}

// Get Firestore and Auth instances, regardless of whether it was just initialized or already existed.
// It's important that these calls happen *after* initializeApp if it runs.
try {
  adminDb = admin.firestore();
} catch (error) {
  console.error('Failed to get Firestore instance for Admin SDK:', error);
  // @ts-ignore
  adminDb = undefined;
}

try {
  adminAuth = admin.auth();
} catch (error) {
  console.error('Failed to get Auth instance for Admin SDK:', error);
  // @ts-ignore
  adminAuth = undefined;
}

export { adminDb, adminAuth };
