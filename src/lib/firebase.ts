// lib/firebase-admin.ts

import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app'; // Correct import for getApps
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore'; // Keep type import if needed elsewhere, though adminDb below is typed by inference
import type { Auth as AdminAuth } from 'firebase-admin/auth'; // Keep type import if needed elsewhere

// Construct serviceAccount from environment variables
// These are expected to be set in the Cloud Run environment (e.g., via secrets)
const serviceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Ensure private key newlines are correctly formatted
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

let adminDb: AdminFirestore;
let adminAuth: AdminAuth; // Optional: if you also export adminAuth

// Check if Firebase Admin SDK has already been initialized
// This is crucial for serverless environments to avoid re-initialization errors
if (getApps().length === 0) {
  console.log('Initializing Firebase Admin SDK with service account...');
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount), // Type assertion if serviceAccount doesn't perfectly match
      // projectId: serviceAccount.projectId, // projectId can also be specified here if not inferred
    });
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error: any) {
    console.error('Firebase Admin SDK initialization error:', error);
    // If initialization fails, adminDb and adminAuth will remain undefined or an error should be handled
    // Depending on how critical this is, you might want to throw the error
    // or ensure adminDb/adminAuth are handled as potentially undefined elsewhere.
    // For now, if it fails, subsequent calls will fail when they try to use adminDb.
  }
} else {
  console.log('Firebase Admin SDK already initialized. Using existing app.');
  // If already initialized, get the default app.
  // This branch might not be strictly necessary if initializeApp handles it,
  // but getApps().length === 0 is the primary guard.
  // admin.app(); // This line gets the default app, already done by subsequent service calls if not specified.
}

// Export the Firestore instance
// It's generally safer to get the service from the specific app instance,
// though admin.firestore() often defaults to the initialized app.
try {
  adminDb = admin.firestore();
} catch (error) {
  console.error('Failed to get Firestore instance:', error);
  // @ts-ignore
  adminDb = undefined; // Explicitly set to undefined on error
}

// Optional: Export Auth instance similarly if used
try {
  adminAuth = admin.auth();
} catch (error) {
  console.error('Failed to get Auth instance:', error);
  // @ts-ignore
  adminAuth = undefined; // Explicitly set to undefined on error
}

export { adminDb, adminAuth }; // Export adminAuth as well if it's used elsewhere