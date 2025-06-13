
import admin, { type app as AdminAppType } from 'firebase-admin'; // Corrected import for type
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import type { Auth as AdminAuth } from 'firebase-admin/auth';

// Variáveis de ambiente para configuração do Firebase Admin SDK
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyInput = process.env.FIREBASE_PRIVATE_KEY;

let adminApp: AdminAppType | undefined = undefined;
let adminDb: AdminFirestore | undefined = undefined;
let adminAuth: AdminAuth | undefined = undefined;

if (!admin.apps.length) {
  console.log("Firebase Admin SDK: No apps initialized, attempting new initialization.");
  try {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      console.log("Firebase Admin SDK: Attempting initialization with GOOGLE_APPLICATION_CREDENTIALS.");
      adminApp = admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: projectId,
      });
    } else if (projectId && clientEmail && privateKeyInput) {
      console.log("Firebase Admin SDK: Attempting initialization with individual environment variables.");
      const privateKey = privateKeyInput.replace(/\\n/g, '\n');
      adminApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey,
        }),
      });
    } else {
      console.warn(
        "Firebase Admin SDK: Credentials not fully provided. Missing GOOGLE_APPLICATION_CREDENTIALS or individual credential env vars (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID)."
      );
    }
  } catch (e) {
    console.error("CRITICAL: Firebase Admin SDK initialization failed during admin.initializeApp():", e);
    adminApp = undefined;
  }

  if (adminApp) {
    adminDb = admin.firestore();
    adminAuth = admin.auth();
    console.log("Firebase Admin SDK: Initialized successfully and 'adminDb', 'adminAuth' are set.");
  } else {
    console.warn("Firebase Admin SDK: 'adminApp' could not be initialized. 'adminDb' and 'adminAuth' will remain undefined.");
  }
} else {
  adminApp = admin.app(); 
  if (adminApp) {
    adminDb = admin.firestore();
    adminAuth = admin.auth();
    console.log("Firebase Admin SDK: Already initialized, using existing app instance. 'adminDb', 'adminAuth' are set.");
  } else {
     console.warn("Firebase Admin SDK: Existing app instance from admin.app() is invalid. 'adminDb' and 'adminAuth' will remain undefined.");
     adminDb = undefined;
     adminAuth = undefined;
  }
}

export { adminApp, adminDb, adminAuth };
