// src/lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import type { Auth as AdminAuth } from 'firebase-admin/auth';

let adminDb: AdminFirestore;
let adminAuth: AdminAuth;

if (getApps().length === 0) {
  console.log("Firebase Admin SDK: Attempting initialization...");
  try {
    const gac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const projectId = process.env.APP_ADMIN_PROJECT_ID;
    const clientEmail = process.env.APP_ADMIN_CLIENT_EMAIL;
    const privateKeyInput = process.env.APP_ADMIN_PRIVATE_KEY;

    if (gac && gac.trim() !== '') {
      console.log("Firebase Admin SDK: Initializing with GOOGLE_APPLICATION_CREDENTIALS.");
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        // Optionally, specify projectId if it's not in the GAC file or you want to override
        // projectId: projectId || "your-default-project-id-if-any",
      });
    } else if (projectId && clientEmail && privateKeyInput) {
      console.log("Firebase Admin SDK: Initializing with APP_ADMIN_ prefixed environment variables.");
      const privateKey = privateKeyInput.replace(/\\n/g, '\n'); // Correctly replace literal \n with newline
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
      });
    } else {
      console.warn(
        "Firebase Admin SDK: Credentials not fully provided. Need either GOOGLE_APPLICATION_CREDENTIALS or all of APP_ADMIN_PROJECT_ID, APP_ADMIN_CLIENT_EMAIL, APP_ADMIN_PRIVATE_KEY. SDK will not be initialized."
      );
      // Leave adminApp uninitialized, subsequent db/auth calls will fail if this path is taken.
    }

    if (admin.apps.length > 0 && admin.apps[0]) { // Check if initialization was successful
        console.log('Firebase Admin SDK initialized successfully.');
    } else {
        // This else block might not be reached if initializeApp throws an error for bad creds,
        // but it's a fallback if it somehow completes without creating an app.
        console.error('Firebase Admin SDK: admin.initializeApp was called but no app was created. Check credentials and logs.');
    }

  } catch (error: any) {
    console.error('CRITICAL: Firebase Admin SDK initialization failed:', error.message);
    console.error('Details:', error);
    console.error('Make sure GOOGLE_APPLICATION_CREDENTIALS is set correctly in your environment, or all APP_ADMIN_PROJECT_ID, APP_ADMIN_CLIENT_EMAIL, and APP_ADMIN_PRIVATE_KEY are correctly set.');
  }
} else {
  console.log('Firebase Admin SDK already initialized. Using existing app.');
}

// Get Firestore and Auth instances
// These will throw if initializeApp failed and no app is available.
try {
  adminDb = admin.firestore();
} catch (error) {
  console.error('Failed to get Firestore instance for Admin SDK (adminDb):', error);
  // @ts-ignore
  adminDb = undefined;
}

try {
  adminAuth = admin.auth();
} catch (error) {
  console.error('Failed to get Auth instance for Admin SDK (adminAuth):', error);
  // @ts-ignore
  adminAuth = undefined;
}

export { adminDb, adminAuth };

// Remove or comment out old constants if they are no longer used by other logic in this file
// const convertAdminTimestampToISO = ...
// const convertAdminTimestampToStringForDisplay = ...
// (Keep them if other exported functions from this file - not shown in current context - use them)
// For now, assuming only the initialization block and exports are relevant to this change.
// The functions like getSiteSettingsAdmin, getAllPostsAdmin, etc., that were in data-admin.ts
// are NOT being moved here. This file is just for initializing and exporting adminDb/adminAuth.
