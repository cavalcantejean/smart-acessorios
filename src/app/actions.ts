// src/app/actions.ts

'use server';

// CORREÇÃO: Adicione esta linha para importar o adminDb
import { adminDb } from '@/lib/firebase-admin'; 

// ATENÇÃO: Verifique e DELETE qualquer linha como "import { getFirestoreUser } from '...'" que possa existir aqui.

import type { UserFirestoreData } from '@/lib/types';

// A função já está declarada aqui, então não a importe.
export async function getFirestoreUser(userId: string): Promise<UserFirestoreData | null> {
  if (!userId) return null;
  try {
    const userDocRef = adminDb.collection('usuarios').doc(userId); // Agora o adminDb será encontrado
    const userDocSnap = await userDocRef.get();
    if (userDocSnap.exists) {
      return userDocSnap.data() as UserFirestoreData;
    }
    return null;
  } catch (error) {
    console.error("Server Action Error: Falha ao buscar usuário", error);
    return null;
  }
}