
import admin from 'firebase-admin';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import type { Auth as AdminAuth } from 'firebase-admin/auth';

// Variables de ambiente para configuração do Firebase Admin SDK
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyInput = process.env.FIREBASE_PRIVATE_KEY;

let adminApp: admin.app.App | undefined = undefined;
let adminDb: AdminFirestore | undefined = undefined;
let adminAuth: AdminAuth | undefined = undefined;

function initializeAdminServices(appInstance: admin.app.App) {
  try {
    adminDb = appInstance.firestore();
    console.log("Firebase Admin SDK: Firestore service initialized from app instance.");
  } catch (e) {
    console.error("Firebase Admin SDK: Failed to initialize Firestore service from app instance:", e);
    adminDb = undefined;
  }
  try {
    adminAuth = appInstance.auth();
    console.log("Firebase Admin SDK: Auth service initialized from app instance.");
  } catch (e) {
    console.error("Firebase Admin SDK: Failed to initialize Auth service from app instance:", e);
    adminAuth = undefined;
  }
}

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
        "Firebase Admin SDK: Credentials not fully provided for new initialization. Missing GOOGLE_APPLICATION_CREDENTIALS or individual credential env vars (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID)."
      );
      // adminApp remains undefined here
    }
  } catch (e) {
    console.error("CRITICAL: Firebase Admin SDK initialization failed during admin.initializeApp():", e);
    adminApp = undefined;
  }

  if (adminApp) {
    initializeAdminServices(adminApp);
    console.log("Firebase Admin SDK: New app initialized successfully and services configured.");
  } else {
    console.warn("Firebase Admin SDK: 'adminApp' could not be initialized during new initialization. Services (adminDb, adminAuth) will remain undefined.");
    adminDb = undefined; 
    adminAuth = undefined;
  }
} else {
  console.log("Firebase Admin SDK: App already initialized. Getting existing app instance.");
  try {
    adminApp = admin.app(); // Get the default app if already initialized
    if (adminApp) {
      initializeAdminServices(adminApp);
      console.log("Firebase Admin SDK: Using existing app instance and services configured.");
    } else {
      // This case implies admin.apps.length > 0 but admin.app() somehow returned falsy.
      // This is highly unlikely if admin.apps.length > 0.
      console.warn("Firebase Admin SDK: admin.app() returned an invalid instance despite admin.apps.length > 0. Services (adminDb, adminAuth) will remain undefined.");
      adminDb = undefined;
      adminAuth = undefined;
    }
  } catch (e) {
    console.error("CRITICAL: Firebase Admin SDK failed to get existing app with admin.app():", e);
    adminApp = undefined;
    adminDb = undefined;
    adminAuth = undefined;
  }
}

export { adminApp, adminDb, adminAuth };
