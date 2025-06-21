import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { getFirestore, type Firestore as AdminFirestore } from 'firebase-admin/firestore';
import { getAuth, type Auth as AdminAuth } from 'firebase-admin/auth';

let adminDb: AdminFirestore;
let adminAuth: AdminAuth;

// Esta é a maneira mais robusta de lidar com as credenciais no Vercel/GCP e localmente.
const serviceAccount = {
  projectId: process.env.APP_ADMIN_PROJECT_ID,
  clientEmail: process.env.APP_ADMIN_CLIENT_EMAIL,
  // Garante que as quebras de linha na chave privada sejam interpretadas corretamente.
  privateKey: process.env.APP_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

// Evita reinicialização durante o hot-reload no desenvolvimento.
if (!getApps().length) {
  try {
    console.log("Initializing Firebase Admin SDK...");
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error('CRITICAL: Firebase Admin SDK initialization failed:', error.message);
  }
}

try {
  adminDb = getFirestore();
  adminAuth = getAuth();
} catch (error) {
  console.error('Failed to get Admin SDK instances:', error);
  // @ts-ignore
  adminDb = undefined;
  // @ts-ignore
  adminAuth = undefined;
}


export { adminDb, adminAuth };