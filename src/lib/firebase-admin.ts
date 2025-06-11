
import admin, { type App as AdminApp } from 'firebase-admin';
import type { Firestore as AdminFirestore } from 'firebase-admin/firestore';
import type { Auth as AdminAuth } from 'firebase-admin/auth';

// Variáveis de ambiente para configuração do Firebase Admin SDK
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'); // Substitui \\n por \n real

let adminApp: AdminApp;
let adminDb: AdminFirestore;
let adminAuth: AdminAuth;

if (!admin.apps.length) {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Se GOOGLE_APPLICATION_CREDENTIALS estiver definido (ex: em ambientes GCP ou com gcloud CLI)
    console.log("Initializing Firebase Admin SDK with GOOGLE_APPLICATION_CREDENTIALS path.");
    adminApp = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: projectId, // Opcional se já estiver no service account
    });
  } else if (projectId && clientEmail && privateKey) {
    // Se as variáveis de ambiente individuais estiverem definidas
    console.log("Initializing Firebase Admin SDK with individual environment variables.");
    adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: clientEmail,
        privateKey: privateKey,
      }),
    });
  } else {
    console.warn(
      "Firebase Admin SDK not initialized. Missing GOOGLE_APPLICATION_CREDENTIALS or individual credential env vars (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID)."
    );
    // @ts-ignore // Para evitar erro de tipo se não inicializado
    adminApp = null; 
  }

  if (adminApp) {
    adminDb = admin.firestore();
    adminAuth = admin.auth();
    console.log("Firebase Admin SDK initialized successfully.");
  }
} else {
  adminApp = admin.app();
  adminDb = admin.firestore();
  adminAuth = admin.auth();
  console.log("Firebase Admin SDK already initialized.");
}

// @ts-ignore
export { adminApp, adminDb, adminAuth };
