
import type { Accessory, Coupon, Testimonial, UserFirestoreData, Post, SiteSettings, SocialLinkSetting, SiteSettingsForClient } from './types';
import { db } from './firebase-client';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  runTransaction
} from 'firebase/firestore';
// Removed: import { getSiteSettingsAdmin } from './data-admin'; 
// import type { ComponentType } from 'react'; // No longer needed here
// Lucide-react icons and PinterestIcon removed as they were only for getBaseSocialLinkSettings

// --- Helper Functions for Firestore ---
// convertTimestampToISO and convertTimestampToStringForDisplay might be used by other functions.
// For now, they are kept. If they are specific only to moved items, they could also be moved.
// Let's assume they are general helpers for now.
const convertTimestampToISO = (timestamp: Timestamp | undefined): string | undefined => {
  return timestamp ? timestamp.toDate().toISOString() : undefined;
};

const convertTimestampToStringForDisplay = (timestamp: Timestamp | undefined): string => {
  return timestamp ? timestamp.toDate().toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : 'N/A';
};

// --- User Management (Firestore - Client SDK for reads) ---
export async function getUserById(id: string): Promise<UserFirestoreData | undefined> {
  if (!db) { console.error("Firestore client db instance not available in getUserById."); return undefined; }
  try {
    const userDocRef = doc(db, "usuarios", id);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return {
        ...data,
        id: userDocSnap.id,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      } as UserFirestoreData;
    }
    return undefined;
  } catch (error) {
    console.error("Error fetching user from Firestore in getUserById:", error);
    return undefined;
  }
}

export async function getAllUsers(): Promise<UserFirestoreData[]> {
  if (!db) { console.error("Firestore client db instance not available in getAllUsers."); return []; }
  try {
    const usersCollectionRef = collection(db, "usuarios");
    const usersSnapshot = await getDocs(query(usersCollectionRef, orderBy("name")));
    return usersSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as UserFirestoreData));
  } catch (error) {
    console.error("Error fetching all users from Firestore:", error);
    return [];
  }
}

// --- Accessory Management (Client SDK for reads and user-initiated writes) ---
// const accessoriesClientCollection = collection(db, "acessorios"); // Moved into functions

export async function getAllAccessories(): Promise<Accessory[]> {
  if (!db) { console.error("Firestore client db instance not available in getAllAccessories."); return []; }
  const accessoriesClientCollection = collection(db, "acessorios");
  try {
    const accessoriesSnapshot = await getDocs(query(accessoriesClientCollection, orderBy("createdAt", "desc")));
    return accessoriesSnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as Accessory));
  } catch (error) {
    console.error("Error fetching all accessories from Firestore:", error);
    return [];
  }
}

export async function getAccessoryById(id: string): Promise<Accessory | undefined> {
  if (!db) { console.error("Firestore client db instance not available in getAccessoryById."); return undefined; }
  try {
    const accessoryDocRef = doc(db, "acessorios", id);
    const accessoryDocSnap = await getDoc(accessoryDocRef);
    if (accessoryDocSnap.exists()) {
      return { id: accessoryDocSnap.id, ...accessoryDocSnap.data() } as Accessory;
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching accessory ${id} from Firestore:`, error);
    return undefined;
  }
}

// --- Utility Functions (Client SDK) ---
export async function getUniqueCategories(): Promise<string[]> {
  const accessoriesList = await getAllAccessories();
  const categoriesSet = new Set<string>();
  accessoriesList.forEach(acc => { if (acc.category) categoriesSet.add(acc.category); });
  return Array.from(categoriesSet).sort();
}

export async function getDailyDeals(): Promise<Accessory[]> {
  if (!db) { console.error("Firestore client db instance not available in getDailyDeals."); return []; }
  const accessoriesClientCollection = collection(db, "acessorios");
  let deals: Accessory[] = [];
  try {
    const dealsQuery = query(accessoriesClientCollection, where("isDeal", "==", true), orderBy("createdAt", "desc"), limit(6));
    const dealsSnapshot = await getDocs(dealsQuery);
    deals = dealsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Accessory));

    if (deals.length === 0) {
      console.log("No specific deals found, attempting fallback query for latest accessories.");
      const fallbackQuery = query(accessoriesClientCollection, orderBy("createdAt", "desc"), limit(2));
      const fallbackSnapshot = await getDocs(fallbackQuery);
      deals = fallbackSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Accessory));
    }
  } catch (error: any) {
    console.error("Error fetching daily deals from Firestore:", error);
    if (error.code === 'failed-precondition' && error.message.includes('requires an index')) {
        console.error("INDEX REQUIRED: The query for daily deals (isDeal == true, orderBy createdAt desc) needs a composite index. Please create it in the Firebase console.");
        console.error("Firebase suggested index creation link (from a similar error, may need adjustment):", error.message.substring(error.message.indexOf('https://')));
    }
    if (deals.length === 0) {
        try {
            console.log("Error in primary deals query, attempting fallback for latest 2 accessories.");
            const fallbackQuery = query(accessoriesClientCollection, orderBy("createdAt", "desc"), limit(2));
            const fallbackSnapshot = await getDocs(fallbackQuery);
            deals = fallbackSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Accessory));
        } catch (fallbackError) {
            console.error("Error fetching fallback daily deals:", fallbackError);
        }
    }
  }
  return deals;
}

// --- Coupon Management (Client SDK for reads) ---
// const couponsClientCollection = collection(db, "cupons"); // Moved into functions

export async function getCoupons(): Promise<Coupon[]> {
  if (!db) { console.error("Firestore client db instance not available in getCoupons."); return []; }
  const couponsClientCollection = collection(db, "cupons");
  try {
    const today = Timestamp.now();
    const q = query(couponsClientCollection, orderBy("expiryDate", "asc"));
    const couponsSnapshot = await getDocs(q);

    const allCoupons = couponsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Coupon));

    return allCoupons.filter(coupon => {
      if (!coupon.expiryDate) return true; // No expiry date means it's always valid from this perspective
      let expiryJsDate: Date;
      if (typeof coupon.expiryDate === 'string') {
        expiryJsDate = new Date(coupon.expiryDate);
      } else if (coupon.expiryDate instanceof Date) {
        expiryJsDate = coupon.expiryDate;
      } else {
        // Handle cases where expiryDate might be an actual client Timestamp if data is mixed
        // This case should ideally not be hit if data is consistently Date or string
        // For safety, if it's a Timestamp object (from firebase/firestore)
        // @ts-ignore
        if (coupon.expiryDate && typeof coupon.expiryDate.toDate === 'function') {
          // @ts-ignore
          expiryJsDate = coupon.expiryDate.toDate();
        } else {
          // If it's truly undefined or an unexpected type, treat as invalid or always expired
          // For filter: return false (expired) or handle as per requirements
          return false; // Example: treat unparseable dates as expired
        }
      }
      return expiryJsDate >= today.toDate();
    }).sort((a,b) => {
        if (!a.expiryDate && !b.expiryDate) return 0;
        if (!a.expiryDate) return 1; // Place items with no expiry date last (or first if -1)
        if (!b.expiryDate) return -1;

        let dateAValue: number;
        if (typeof a.expiryDate === 'string') {
          dateAValue = new Date(a.expiryDate).getTime();
        } else if (a.expiryDate instanceof Date) {
          dateAValue = a.expiryDate.getTime();
        } else { // Fallback for undefined or other types, place non-expiring last
          // @ts-ignore
          dateAValue = a.expiryDate && typeof a.expiryDate.toDate === 'function' ? a.expiryDate.toDate().getTime() : Infinity;
        }

        let dateBValue: number;
        if (typeof b.expiryDate === 'string') {
          dateBValue = new Date(b.expiryDate).getTime();
        } else if (b.expiryDate instanceof Date) {
          dateBValue = b.expiryDate.getTime();
        } else { // Fallback for undefined or other types
          // @ts-ignore
          dateBValue = b.expiryDate && typeof b.expiryDate.toDate === 'function' ? b.expiryDate.toDate().getTime() : Infinity;
        }
        return dateAValue - dateBValue;
    });
  } catch (error) {
    console.error("Error fetching coupons from Firestore:", error);
    return [];
  }
}

export async function getCouponById(id: string): Promise<Coupon | undefined> {
   if (!db) { console.error("Firestore client db instance not available in getCouponById."); return undefined; }
  try {
    const couponDocRef = doc(db, "cupons", id);
    const couponDocSnap = await getDoc(couponDocRef);
    if (couponDocSnap.exists()) {
      return { id: couponDocSnap.id, ...couponDocSnap.data() } as Coupon;
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching coupon ${id} from Firestore:`, error);
    return undefined;
  }
}

// --- Post Management (Client SDK for reads) ---
// const postsClientCollection = collection(db, "posts"); // Moved into functions

export async function getAllPosts(): Promise<Post[]> {
  if (!db) { console.error("Firestore client db instance not available in getAllPosts."); return []; }
  const postsClientCollection = collection(db, "posts");
  try {
    const postsSnapshot = await getDocs(query(postsClientCollection, orderBy("publishedAt", "desc")));
    return postsSnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      tags: docSnap.data().tags || [],
    } as Post));
  } catch (error) {
    console.error("Error fetching all posts from Firestore:", error);
    return [];
  }
}

export async function getPostById(id: string): Promise<Post | undefined> {
  if (!db) { console.error("Firestore client db instance not available in getPostById."); return undefined; }
  try {
    const postDocRef = doc(db, "posts", id);
    const postDocSnap = await getDoc(postDocRef);
    if (postDocSnap.exists()) {
      return { id: postDocSnap.id, ...postDocSnap.data(), tags: postDocSnap.data().tags || [] } as Post;
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching post ${id} from Firestore:`, error);
    return undefined;
  }
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  if (!db) { console.error("Firestore client db instance not available in getPostBySlug."); return undefined; }
  const postsClientCollection = collection(db, "posts");
  try {
    const q = query(postsClientCollection, where("slug", "==", slug), limit(1));
    const postSnapshot = await getDocs(q);
    if (!postSnapshot.empty) {
      const docSnap = postSnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data(), tags: docSnap.data().tags || [] } as Post;
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching post by slug ${slug} from Firestore:`, error);
    return undefined;
  }
}

export async function getLatestPosts(count: number): Promise<Post[]> {
  if (!db) { console.error("Firestore client db instance not available in getLatestPosts."); return []; }
  const postsClientCollection = collection(db, "posts");
  try {
    const q = query(postsClientCollection, orderBy("publishedAt", "desc"), limit(count));
    const postsSnapshot = await getDocs(q);
    return postsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data(), tags: docSnap.data().tags || [] } as Post));
  } catch (error) {
    console.error("Error fetching latest posts from Firestore:", error);
    return [];
  }
}

// checkAndAwardBadges function removed as badge system is removed.
