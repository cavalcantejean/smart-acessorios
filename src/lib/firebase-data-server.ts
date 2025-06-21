// src/lib/firebase-data-server.ts

// CORREÇÃO 1: Importações essenciais que estavam faltando.
import { adminDb } from './firebase-admin'; // A importação mais importante que faltava!
import { Timestamp, QueryDocumentSnapshot, DocumentData } from 'firebase-admin/firestore';
import type { Accessory, Coupon, Post, UserFirestoreData } from './types';

// =================================================================
// CORREÇÃO 2: A função getFirestoreUser movida para cá, que é seu lugar correto.
// Agora você pode remover a função e a importação dela do 'actions.ts'.
// =================================================================
export async function getFirestoreUser(userId: string): Promise<UserFirestoreData | null> {
  if (!userId) return null;
  try {
    const userDocRef = adminDb.collection('usuarios').doc(userId);
    const userDocSnap = await userDocRef.get();
    if (userDocSnap.exists) {
      // Usando a função serializeData para consistência
      return serializeData(userDocSnap.data()) as UserFirestoreData;
    }
    return null;
  } catch (error) {
    console.error("[Server] Error fetching user:", error);
    return null;
  }
}

// CORREÇÃO 3: Tipagem adicionada ao parâmetro 'data' para evitar erro de 'any'.
function serializeData(data: DocumentData | null | undefined) {
  if (!data) return data;
  
  const serializedObject: { [key: string]: any } = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      serializedObject[key] = value.toDate().toISOString();
    } else {
      serializedObject[key] = value;
    }
  }
  return serializedObject;
}

export async function getAllAccessories(): Promise<Accessory[]> {
  try {
    const accessoriesSnapshot = await adminDb.collection("acessorios").orderBy("createdAt", "desc").get();
    // CORREÇÃO 4: Adicionado o tipo para 'doc'
    return accessoriesSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...serializeData(doc.data()),
    } as Accessory));
  } catch (error) {
    console.error("[Server] Error fetching all accessories:", error);
    return [];
  }
}

export async function getDailyDeals(): Promise<Accessory[]> {
  try {
    const dealsQuery = adminDb.collection("acessorios")
      .where("isDeal", "==", true)
      .orderBy("createdAt", "desc")
      .limit(6);

    const dealsSnapshot = await dealsQuery.get();
    let deals = dealsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ 
      id: doc.id, 
      ...serializeData(doc.data()), 
    } as Accessory));

    if (deals.length === 0) {
      const fallbackSnapshot = await adminDb.collection("acessorios").orderBy("createdAt", "desc").limit(2).get();
      deals = fallbackSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ 
        id: doc.id, 
        ...serializeData(doc.data()), 
      } as Accessory));
    }
    
    // CORREÇÃO AQUI: Faltava este return!
    return deals;

  } catch (error) {
    console.error("[Server] Error fetching daily deals:", error);
    return []; // O 'catch' já tinha um return, mas o 'try' não.
  }
}

export async function getLatestPosts(count: number): Promise<Post[]> {
   try {
    const postsSnapshot = await adminDb.collection("posts")
      .orderBy("publishedAt", "desc")
      .limit(count)
      .get();
      
    // CORREÇÃO AQUI: Verifique se a sintaxe para tipar o 'doc' está exatamente assim.
    return postsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ 
      id: doc.id, 
      ...serializeData(doc.data()), 
    } as Post));

  } catch (error) {
    console.error("[Server] Error fetching latest posts:", error);
    return [];
  }
}

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const now = Timestamp.now(); // Use o Timestamp do Admin SDK para queries
    
    const couponsQuery = adminDb.collection("cupons")
      .where('expiryDate', '>=', now)
      .orderBy('expiryDate', 'asc');
      
    const couponsSnapshot = await couponsQuery.get();

    const nonExpiringQuery = adminDb.collection("cupons").where('expiryDate', '==', null);
    const nonExpiringSnapshot = await nonExpiringQuery.get();

    const validCoupons = couponsSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...serializeData(doc.data()), } as Coupon));
    const nonExpiringCoupons = nonExpiringSnapshot.docs.map((doc: QueryDocumentSnapshot) => ({ id: doc.id, ...serializeData(doc.data()), } as Coupon));

    return [...validCoupons, ...nonExpiringCoupons];
    
  } catch (error) {
    console.error("[Server] Error fetching coupons:", error);
    return [];
  }
}

export async function getUniqueCategories(): Promise<string[]> {
  const accessoriesList = await getAllAccessories(); // Esta função já usa o adminDb
  const categoriesSet = new Set<string>();
  accessoriesList.forEach(acc => {
    // Apenas uma boa prática: assegure-se de que seu tipo 'Accessory' tenha a propriedade 'category'
    if (acc.category) {
      categoriesSet.add(acc.category);
    }
  });
  return Array.from(categoriesSet).sort();
}