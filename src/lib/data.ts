
import type { Accessory, Coupon, Testimonial, UserFirestoreData, Post, Comment, BadgeCriteriaData, PendingCommentDisplay, CategoryCount, TopAccessoryInfo, RecentCommentInfo, AnalyticsData, SiteSettings, SocialLinkSetting, CommentWithAccessoryInfo } from './types';
import { allBadges, generateBadgeCriteriaData } from './badges';
import { db } from './firebase'; // SDK Cliente
import { adminDb } from './firebase-admin'; // SDK Admin
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
} from 'firebase/firestore'; // Importações do SDK Cliente

// --- Helper Functions for Firestore ---
const convertTimestampToISO = (timestamp: Timestamp | undefined): string | undefined => {
  return timestamp ? timestamp.toDate().toISOString() : undefined;
};

const convertTimestampToStringForDisplay = (timestamp: Timestamp | undefined): string => {
  return timestamp ? timestamp.toDate().toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : 'N/A';
};


// --- Site Settings (Stays Local/Mock for now) ---
let siteSettings: SiteSettings = {
  siteTitle: 'SmartAcessorios',
  siteDescription: 'Descubra os melhores acessórios para smartphones com links de afiliados e resumos de IA.',
  siteLogoUrl: '',
  siteFaviconUrl: '',
  socialLinks: [
    { platform: "Facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61575978087535", placeholderUrl: "https://facebook.com/seu_usuario", customImageUrl: "" },
    { platform: "Instagram", label: "Instagram", url: "https://www.instagram.com/smart.acessorios", placeholderUrl: "https://instagram.com/seu_usuario", customImageUrl: "" },
    { platform: "Twitter", label: "X (Twitter)", url: "https://x.com/Smart_acessorio", placeholderUrl: "https://x.com/seu_usuario", customImageUrl: "" },
    { platform: "TikTok", label: "TikTok", url: "https://tiktok.com/@smartacessorio", placeholderUrl: "https://tiktok.com/@seu_usuario", customImageUrl: "" },
    { platform: "WhatsApp", label: "WhatsApp", url: "https://whatsapp.com/channel/0029VbAKxmx5PO18KEZQkJ2V", placeholderUrl: "https://wa.me/seu_numero_ou_link_canal", customImageUrl: "" },
    { platform: "Pinterest", label: "Pinterest", url: "https://pinterest.com/smartacessorios", placeholderUrl: "https://pinterest.com/seu_usuario", customImageUrl: "" },
    { platform: "Telegram", label: "Telegram", url: "https://t.me/smartacessorios", placeholderUrl: "https://t.me/seu_canal", customImageUrl: "" },
    { platform: "Discord", label: "Discord", url: "https://discord.gg/89bwDJWh3y", placeholderUrl: "https://discord.gg/seu_servidor", customImageUrl: "" },
    { platform: "Snapchat", label: "Snapchat", url: "https://snapchat.com/add/smartacessorios", placeholderUrl: "https://snapchat.com/add/seu_usuario", customImageUrl: "" },
    { platform: "Threads", label: "Threads", url: "https://threads.net/@smart.acessorios", placeholderUrl: "https://threads.net/@seu_usuario", customImageUrl: "" },
    { platform: "Email", label: "Email", url: "mailto:smartacessori@gmail.com", placeholderUrl: "mailto:seu_email@example.com", customImageUrl: "" },
    { platform: "YouTube", label: "YouTube", url: "https://youtube.com/@smart.acessorios", placeholderUrl: "https://youtube.com/@seu_canal", customImageUrl: "" },
    { platform: "Kwai", label: "Kwai", url: "https://k.kwai.com/u/@SmartAcessorios", placeholderUrl: "https://k.kwai.com/u/@seu_usuario", customImageUrl: "" }
  ]
};
export function getSiteSettings(): SiteSettings { return { ...siteSettings, socialLinks: siteSettings.socialLinks.map(link => ({ ...link })) }; }
export function getBaseSocialLinkSettings(): SocialLinkSetting[] { return siteSettings.socialLinks.map(link => ({ ...link }));}
export function updateSiteSettings(newSettings: Partial<SiteSettings>): SiteSettings {
  if (newSettings.siteTitle !== undefined) siteSettings.siteTitle = newSettings.siteTitle;
  if (newSettings.siteDescription !== undefined) siteSettings.siteDescription = newSettings.siteDescription;
  if (newSettings.siteLogoUrl !== undefined) siteSettings.siteLogoUrl = newSettings.siteLogoUrl;
  if (newSettings.siteFaviconUrl !== undefined) siteSettings.siteFaviconUrl = newSettings.siteFaviconUrl;
  if (newSettings.socialLinks) {
    siteSettings.socialLinks = siteSettings.socialLinks.map(currentLink => {
      const submittedLinkData = newSettings.socialLinks.find(sl => sl.platform === currentLink.platform);
      return { ...currentLink, url: submittedLinkData?.url ?? currentLink.url, customImageUrl: submittedLinkData?.customImageUrl ?? currentLink.customImageUrl, };
    });
  }
  return getSiteSettings();
}

// --- Testimonials (Stays Local/Mock for now) ---
const testimonials: Testimonial[] = [
  { id: 'testimonial1', name: 'Ana Silva', quote: 'Encontrei os melhores acessórios aqui! A seleção de ofertas do dia é incrível e os resumos de IA me ajudam a decidir rapidamente. Recomendo!', role: 'Cliente Satisfeita', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'woman portrait' },
  { id: 'testimonial2', name: 'Carlos Pereira', quote: 'Os cupons promocionais são ótimos! Consegui um bom desconto na minha última compra de fones de ouvido. O site é fácil de navegar.', role: 'Entusiasta de Gadgets', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'man portrait' },
  { id: 'testimonial3', name: 'Juliana Costa', quote: 'Adoro a variedade de produtos e a clareza das descrições. A funcionalidade de favoritar é muito útil para salvar itens que quero comprar depois.', role: 'Compradora Online', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'person smiling' }
];
export function getTestimonials(): Testimonial[] { return testimonials; }


// --- User Management (Firestore - Client SDK for reads, Admin SDK could be used for admin ops) ---
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
        createdAt: data.createdAt, // Mantém como Timestamp
        updatedAt: data.updatedAt, // Mantém como Timestamp
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

// toggleFollowUser and toggleUserAdminStatus should ideally use Admin SDK if they are admin-only operations
// or enforce rules if client-callable. For now, keeping client SDK for toggleFollow, needs rules.
export async function toggleFollowUser(currentUserId: string, targetUserId: string): Promise<{ isFollowing: boolean; targetFollowersCount: number } | null> {
  if (!db) { console.error("Firestore client db instance not available in toggleFollowUser."); return null; }
  if (currentUserId === targetUserId) return null;

  const currentUserDocRef = doc(db, "usuarios", currentUserId);
  const targetUserDocRef = doc(db, "usuarios", targetUserId);

  try {
    let isFollowing = false;
    let finalFollowersCount = 0;

    await runTransaction(db, async (transaction) => {
      const currentUserDoc = await transaction.get(currentUserDocRef);
      const targetUserDoc = await transaction.get(targetUserDocRef);

      if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
        throw new Error("User not found");
      }

      const currentUserData = currentUserDoc.data() as UserFirestoreData;
      const targetUserData = targetUserDoc.data() as UserFirestoreData;

      currentUserData.following = currentUserData.following || [];
      targetUserData.followers = targetUserData.followers || [];

      if (currentUserData.following.includes(targetUserId)) {
        transaction.update(currentUserDocRef, { following: arrayRemove(targetUserId), updatedAt: serverTimestamp() });
        transaction.update(targetUserDocRef, { followers: arrayRemove(currentUserId), updatedAt: serverTimestamp() });
        isFollowing = false;
        finalFollowersCount = (targetUserData.followers.length || 1) - 1;
      } else {
        transaction.update(currentUserDocRef, { following: arrayUnion(targetUserId), updatedAt: serverTimestamp() });
        transaction.update(targetUserDocRef, { followers: arrayUnion(currentUserId), updatedAt: serverTimestamp() });
        isFollowing = true;
        finalFollowersCount = (targetUserData.followers.length || 0) + 1;
      }
    });

    await checkAndAwardBadges(currentUserId); // Assumes getUserById uses client SDK
    await checkAndAwardBadges(targetUserId);  // Assumes getUserById uses client SDK
    return { isFollowing, targetFollowersCount: finalFollowersCount };
  } catch (error) {
    console.error("Error in toggleFollowUser transaction:", error);
    return null;
  }
}

export async function toggleUserAdminStatus(userId: string): Promise<UserFirestoreData | null> {
  // This should ideally use Admin SDK if called from an admin panel
  if (!adminDb) { console.error("Firebase Admin SDK (adminDb) is not initialized in toggleUserAdminStatus."); return null; }
  const userDocRef = adminDb.collection("usuarios").doc(userId);
  try {
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) return null;
    const currentIsAdmin = userDoc.data()?.isAdmin || false;
    await userDocRef.update({ isAdmin: !currentIsAdmin, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    const updatedUserDoc = await userDocRef.get();
    return { id: updatedUserDoc.id, ...updatedUserDoc.data() } as UserFirestoreData;
  } catch (error) {
    console.error("Error toggling user admin status with Admin SDK:", error);
    return null;
  }
}

// --- Accessory Management ---
// Reads can use client SDK, writes by admin should use Admin SDK

const accessoriesClientCollection = collection(db, "acessorios");

export async function getAllAccessories(): Promise<Accessory[]> {
  if (!db) { console.error("Firestore client db instance not available in getAllAccessories."); return []; }
  try {
    const accessoriesSnapshot = await getDocs(query(accessoriesClientCollection, orderBy("createdAt", "desc")));
    return accessoriesSnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      comments: docSnap.data().comments || [],
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
      return { id: accessoryDocSnap.id, ...accessoryDocSnap.data(), comments: accessoryDocSnap.data().comments || [] } as Accessory;
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching accessory ${id} from Firestore:`, error);
    return undefined;
  }
}

// Renamed original addAccessory to addAccessoryWithClientSDK - NOT FOR ADMIN USE FROM SERVER ACTION
// export async function addAccessoryWithClientSDK(accessoryData: Omit<Accessory, 'id' | 'likedBy' | 'comments' | 'createdAt' | 'updatedAt'> & { isDeal?: boolean }): Promise<Accessory> {
//   // ... (implementation using client 'db')
// }

// New function using Firebase Admin SDK
export async function addAccessoryWithAdmin(accessoryData: Omit<Accessory, 'id' | 'likedBy' | 'comments' | 'createdAt' | 'updatedAt'> & { isDeal?: boolean }): Promise<Accessory> {
  if (!adminDb) {
    console.error("[Data:addAccessoryWithAdmin] Firebase Admin SDK (adminDb) is not initialized.");
    throw new Error("Firebase Admin SDK (adminDb) is not initialized in addAccessoryWithAdmin.");
  }
  const newAccessoryData = {
    ...accessoryData,
    price: accessoryData.price ? accessoryData.price.toString().replace(',', '.') : null,
    likedBy: [],
    comments: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(), // Use admin serverTimestamp
    updatedAt: admin.firestore.FieldValue.serverTimestamp(), // Use admin serverTimestamp
    category: accessoryData.category || null,
    imageHint: accessoryData.imageHint || null,
    aiSummary: accessoryData.aiSummary || null,
    embedHtml: accessoryData.embedHtml || null,
    isDeal: accessoryData.isDeal || false,
  };
  console.log("[Data:addAccessoryWithAdmin] Data prepared for Firestore (Admin SDK):", JSON.stringify(newAccessoryData, null, 2));
  try {
    const docRef = await adminDb.collection('acessorios').add(newAccessoryData);
    console.log("[Data:addAccessoryWithAdmin] Document added with ID:", docRef.id);
    // Firestore Timestamps from admin.firestore.FieldValue.serverTimestamp() are handled correctly by SDK
    return {
      id: docRef.id,
      ...accessoryData, // Return original data plus ID
      price: newAccessoryData.price || undefined,
      category: newAccessoryData.category || undefined,
      imageHint: newAccessoryData.imageHint || undefined,
      aiSummary: newAccessoryData.aiSummary || undefined,
      embedHtml: newAccessoryData.embedHtml || undefined,
      isDeal: newAccessoryData.isDeal,
      likedBy: [],
      comments: [],
      // Timestamps will be populated correctly on read or by Firestore itself
    } as Accessory;
  } catch (error: any) {
    console.error("[Data:addAccessoryWithAdmin] Detailed error during addDoc (Admin SDK):", error);
    throw error;
  }
}


// updateAccessory and deleteAccessory should also be adapted if they are admin-only server actions
export async function updateAccessory(accessoryId: string, accessoryData: Partial<Omit<Accessory, 'id' | 'likedBy' | 'comments'>>): Promise<Accessory | null> {
  if (!adminDb) { console.error("Firebase Admin SDK (adminDb) is not initialized in updateAccessory."); return null; }
  const accessoryDocRef = adminDb.collection("acessorios").doc(accessoryId);
  try {
    const updateData: any = { ...accessoryData, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (updateData.price) updateData.price = updateData.price.toString().replace(',', '.');
    await accessoryDocRef.update(updateData);
    const updatedDoc = await accessoryDocRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Accessory;
  } catch (error) {
    console.error(`Error updating accessory ${accessoryId} with Admin SDK:`, error);
    return null;
  }
}

export async function deleteAccessory(accessoryId: string): Promise<boolean> {
  if (!adminDb) { console.error("Firebase Admin SDK (adminDb) is not initialized in deleteAccessory."); return false; }
  const accessoryDocRef = adminDb.collection("acessorios").doc(accessoryId);
  try {
    await accessoryDocRef.delete();
    return true;
  } catch (error) {
    console.error(`Error deleting accessory ${accessoryId} with Admin SDK:`, error);
    return false;
  }
}

// toggleLikeOnAccessory and addCommentToAccessoryData are client-initiated, so client SDK is fine here, assuming rules allow.
export async function toggleLikeOnAccessory(accessoryId: string, userId: string): Promise<{ likedBy: string[], likesCount: number } | null> {
  if (!db) { console.error("Firestore client db instance not available in toggleLikeOnAccessory."); return null; }
  const accessoryDocRef = doc(db, "acessorios", accessoryId);
  try {
    let newLikedBy: string[] = [];
    await runTransaction(db, async (transaction) => {
      const accessoryDoc = await transaction.get(accessoryDocRef);
      if (!accessoryDoc.exists()) throw new Error("Accessory not found");
      const currentLikedBy = accessoryDoc.data()?.likedBy || [];
      if (currentLikedBy.includes(userId)) {
        newLikedBy = currentLikedBy.filter((id: string) => id !== userId);
        transaction.update(accessoryDocRef, { likedBy: arrayRemove(userId), updatedAt: serverTimestamp() });
      } else {
        newLikedBy = [...currentLikedBy, userId];
        transaction.update(accessoryDocRef, { likedBy: arrayUnion(userId), updatedAt: serverTimestamp() });
      }
    });
    await checkAndAwardBadges(userId);
    return { likedBy: newLikedBy, likesCount: newLikedBy.length };
  } catch (error) {
    console.error(`Error toggling like for accessory ${accessoryId} by user ${userId}:`, error);
    return null;
  }
}

export async function addCommentToAccessoryData(
  accessoryId: string,
  userId: string,
  userName: string,
  text: string,
  status: 'approved' | 'pending_review' | 'rejected' = 'approved'
): Promise<Comment | null> {
  if (!db) { console.error("Firestore client db instance not available in addCommentToAccessoryData."); return null; }
  const accessoryDocRef = doc(db, "acessorios", accessoryId);
  try {
    const newComment: Omit<Comment, 'id' | 'createdAt'> & { createdAt: any } = { 
      userId,
      userName,
      text,
      status,
      createdAt: serverTimestamp(), 
    };
    const commentWithId = { ...newComment, id: doc(collection(db, '_')).id }; 

    await updateDoc(accessoryDocRef, {
      comments: arrayUnion(commentWithId),
      updatedAt: serverTimestamp()
    });

    if (status === 'approved') {
      await checkAndAwardBadges(userId);
    }
    return { ...commentWithId, createdAt: Timestamp.now() } as Comment; 
  } catch (error) {
    console.error(`Error adding comment to accessory ${accessoryId}:`, error);
    return null;
  }
}

export async function updateCommentStatus(accessoryId: string, commentId: string, newStatus: 'approved' | 'rejected'): Promise<Comment | null> {
  // This is an admin operation, should use Admin SDK.
  if (!adminDb) { console.error("Firebase Admin SDK (adminDb) is not initialized in updateCommentStatus."); return null; }
  const accessoryDocRef = adminDb.collection("acessorios").doc(accessoryId);
  try {
    let updatedCommentData: Comment | null = null;
    await adminDb.runTransaction(async (transaction) => {
      const accessoryDoc = await transaction.get(accessoryDocRef);
      if (!accessoryDoc.exists) throw "Document does not exist!";
      
      const commentsArray = (accessoryDoc.data()?.comments || []) as Comment[];
      const commentIndex = commentsArray.findIndex(c => c.id === commentId);

      if (commentIndex === -1) throw "Comment not found in array";

      const newCommentsArray = commentsArray.map((c, index) =>
        index === commentIndex ? { ...c, status: newStatus, updatedAt: admin.firestore.FieldValue.serverTimestamp() } : c 
      );
      
      transaction.update(accessoryDocRef, { comments: newCommentsArray, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
      updatedCommentData = newCommentsArray[commentIndex];
    });

    if (updatedCommentData && newStatus === 'approved') {
      await checkAndAwardBadges(updatedCommentData.userId); // checkAndAwardBadges needs to handle admin context or use client SDK after ensuring user exists.
    }
    return updatedCommentData;
  } catch (error) {
    console.error(`Error updating status for comment ${commentId} on accessory ${accessoryId} with Admin SDK:`, error);
    return null;
  }
}

// --- Utility Functions (continue using client SDK for reads) ---
export async function getUniqueCategories(): Promise<string[]> {
  const accessoriesList = await getAllAccessories(); 
  const categoriesSet = new Set<string>();
  accessoriesList.forEach(acc => { if (acc.category) categoriesSet.add(acc.category); });
  return Array.from(categoriesSet).sort();
}

export async function getDailyDeals(): Promise<Accessory[]> {
  if (!db) { console.error("Firestore client db instance not available in getDailyDeals."); return []; }
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

// --- Coupon Management (Admin SDK for writes, client SDK for reads) ---
const couponsClientCollection = collection(db, "cupons");

export async function getCoupons(): Promise<Coupon[]> {
  if (!db) { console.error("Firestore client db instance not available in getCoupons."); return []; }
  try {
    const today = Timestamp.now();
    const q = query(couponsClientCollection, orderBy("expiryDate", "asc")); 
    const couponsSnapshot = await getDocs(q);
    
    const allCoupons = couponsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Coupon));
    
    return allCoupons.filter(coupon => {
      if (!coupon.expiryDate) return true; 
      const expiryDate = coupon.expiryDate instanceof Timestamp ? coupon.expiryDate.toDate() : new Date(coupon.expiryDate as any);
      return expiryDate >= today.toDate(); 
    }).sort((a,b) => { 
        if (!a.expiryDate && !b.expiryDate) return 0;
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        const dateA = a.expiryDate instanceof Timestamp ? a.expiryDate.toMillis() : new Date(a.expiryDate as any).getTime();
        const dateB = b.expiryDate instanceof Timestamp ? b.expiryDate.toMillis() : new Date(b.expiryDate as any).getTime();
        return dateA - dateB;
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

export async function addCoupon(couponData: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Coupon> {
  if (!adminDb) { throw new Error("Firebase Admin SDK (adminDb) is not initialized in addCoupon."); }
  const newCouponData: any = {
    ...couponData,
    expiryDate: couponData.expiryDate ? admin.firestore.Timestamp.fromDate(new Date(couponData.expiryDate as any)) : null, 
    store: couponData.store || null,
    applyUrl: couponData.applyUrl || null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const docRef = await adminDb.collection('cupons').add(newCouponData);
  return { id: docRef.id, ...couponData, expiryDate: newCouponData.expiryDate } as Coupon; // Adjust return type
}

export async function updateCoupon(couponId: string, couponData: Partial<Omit<Coupon, 'id'>>): Promise<Coupon | null> {
  if (!adminDb) { console.error("Firebase Admin SDK (adminDb) is not initialized in updateCoupon."); return null; }
  const couponDocRef = adminDb.collection("cupons").doc(couponId);
  try {
    const updateData: Record<string, any> = { ...couponData, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (couponData.expiryDate === "") {
        updateData.expiryDate = null; 
    } else if (couponData.expiryDate) {
        updateData.expiryDate = admin.firestore.Timestamp.fromDate(new Date(couponData.expiryDate as any));
    }
    if (couponData.store === "") updateData.store = null;
    if (couponData.applyUrl === "") updateData.applyUrl = null;

    await couponDocRef.update(updateData);
    const updatedDoc = await couponDocRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Coupon;
  } catch (error) {
    console.error(`Error updating coupon ${couponId} with Admin SDK:`, error);
    return null;
  }
}

export async function deleteCoupon(couponId: string): Promise<boolean> {
  if (!adminDb) { console.error("Firebase Admin SDK (adminDb) is not initialized in deleteCoupon."); return false; }
  const couponDocRef = adminDb.collection("cupons").doc(couponId);
  try {
    await couponDocRef.delete();
    return true;
  } catch (error) {
    console.error(`Error deleting coupon ${couponId} with Admin SDK:`, error);
    return false;
  }
}

// --- Post Management (Admin SDK for writes, client SDK for reads) ---
const postsClientCollection = collection(db, "posts");

export async function getAllPosts(): Promise<Post[]> {
  if (!db) { console.error("Firestore client db instance not available in getAllPosts."); return []; }
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
  try {
    const q = query(postsClientCollection, orderBy("publishedAt", "desc"), limit(count));
    const postsSnapshot = await getDocs(q);
    return postsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data(), tags: docSnap.data().tags || [] } as Post));
  } catch (error) {
    console.error("Error fetching latest posts from Firestore:", error);
    return [];
  }
}

export async function addPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
  if (!adminDb) { throw new Error("Firebase Admin SDK (adminDb) is not initialized in addPost."); }
  const newPostData: any = {
    ...postData,
    publishedAt: postData.publishedAt ? admin.firestore.Timestamp.fromDate(new Date(postData.publishedAt as any)) : admin.firestore.Timestamp.now(),
    tags: postData.tags || [],
    embedHtml: postData.embedHtml || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const docRef = await adminDb.collection('posts').add(newPostData);
  return { id: docRef.id, ...postData, publishedAt: newPostData.publishedAt } as Post; // Adjust return
}

export async function updatePost(postId: string, postData: Partial<Omit<Post, 'id'>>): Promise<Post | null> {
  if (!adminDb) { console.error("Firebase Admin SDK (adminDb) is not initialized in updatePost."); return null; }
  const postDocRef = adminDb.collection("posts").doc(postId);
  try {
    const updateData: Record<string, any> = { ...postData, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (postData.publishedAt) {
        updateData.publishedAt = admin.firestore.Timestamp.fromDate(new Date(postData.publishedAt as any));
    }
    if (postData.tags && !Array.isArray(postData.tags)) { 
        updateData.tags = (postData.tags as unknown as string).split(',').map(t => t.trim()).filter(t => t);
    }
    await postDocRef.update(updateData);
    const updatedDoc = await postDocRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Post;
  } catch (error) {
    console.error(`Error updating post ${postId} with Admin SDK:`, error);
    return null;
  }
}

export async function deletePost(postId: string): Promise<boolean> {
  if (!adminDb) { console.error("Firebase Admin SDK (adminDb) is not initialized in deletePost."); return false; }
  const postDocRef = adminDb.collection("posts").doc(postId);
  try {
    await postDocRef.delete();
    return true;
  } catch (error) {
    console.error(`Error deleting post ${postId} with Admin SDK:`, error);
    return false;
  }
}

// --- Badge System (Needs client SDK for user data read if checkAndAwardBadges is client-callable, or needs Admin SDK for user data read if fully server-side) ---
export async function checkAndAwardBadges(userId: string): Promise<void> {
  // This function might be called from client-side (e.g., after a like/comment) or server-side.
  // If called server-side in a context without client auth, it needs admin SDK to read user.
  // For simplicity here, assuming it might be called where client 'db' is appropriate.
  if (!db) { console.error("Firestore client db instance not available for badge checking."); return; }
  const user = await getUserById(userId); // Uses client SDK
  if (!user) { console.warn(`User ${userId} not found for badge checking.`); return; }

  const criteriaData = await generateBadgeCriteriaData(user); 
  let userBadges = user.badges || [];
  let badgesUpdated = false;

  for (const badge of allBadges) {
    if (!userBadges.includes(badge.id) && badge.criteria(user, criteriaData)) {
      userBadges.push(badge.id);
      badgesUpdated = true;
    }
  }

  if (badgesUpdated) {
    const userDocRef = doc(db, "usuarios", userId); // Use client 'db'
    try {
      await updateDoc(userDocRef, { badges: userBadges, updatedAt: serverTimestamp() });
      console.log(`Badges updated for user ${userId}. New badges: ${userBadges.join(', ')}`);
    } catch (error) {
      console.error(`Error updating badges for user ${userId} in Firestore (client SDK):`, error);
    }
  }
}

// --- Moderation (Admin SDK) ---
export async function getPendingComments(): Promise<PendingCommentDisplay[]> {
  if (!adminDb) { console.error("Firebase Admin SDK (adminDb) is not initialized in getPendingComments."); return []; }
  const allAccessoriesSnapshot = await adminDb.collection('acessorios').orderBy("createdAt", "desc").get();
  const allAccessories = allAccessoriesSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Accessory));
  
  const pending: PendingCommentDisplay[] = [];
  allAccessories.forEach(acc => {
    (acc.comments || []).forEach(comment => {
      if (comment.status === 'pending_review') {
        pending.push({
          comment: {
            ...comment,
            createdAt: comment.createdAt instanceof Timestamp ? comment.createdAt : admin.firestore.Timestamp.fromDate(new Date(comment.createdAt as any)),
          },
          accessoryId: acc.id,
          accessoryName: acc.name,
        });
      }
    });
  });
  // @ts-ignore
  return pending.sort((a, b) => b.comment.createdAt.toMillis() - a.comment.createdAt.toMillis());
}


// --- Analytics Data (Admin SDK for secure counts and reads) ---
const getTotalUsersCount = async (): Promise<number> => {
  if (!adminDb) return 0;
  const snapshot = await adminDb.collection("usuarios").count().get();
  return snapshot.data().count;
};
const getTotalAccessoriesCount = async (): Promise<number> => {
  if (!adminDb) return 0;
  const snapshot = await adminDb.collection("acessorios").count().get();
  return snapshot.data().count;
};
const getTotalApprovedCommentsCount = async (): Promise<number> => {
  if (!adminDb) return 0;
  const accessoriesSnapshot = await adminDb.collection('acessorios').get();
  const accessoriesList = accessoriesSnapshot.docs.map(d => d.data() as Accessory);
  return accessoriesList.reduce((sum, acc) => sum + (acc.comments?.filter(c => c.status === 'approved').length || 0), 0);
};
const getAccessoriesPerCategory = async (): Promise<CategoryCount[]> => {
  if (!adminDb) return [];
  const accessoriesSnapshot = await adminDb.collection('acessorios').get();
  const accessoriesList = accessoriesSnapshot.docs.map(d => d.data() as Accessory);
  const counts: Record<string, number> = {};
  accessoriesList.forEach(acc => { const category = acc.category || 'Sem Categoria'; counts[category] = (counts[category] || 0) + 1; });
  return Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a,b) => b.count - a.count);
};
const getMostLikedAccessories = async (topN: number = 5): Promise<TopAccessoryInfo[]> => {
  if (!adminDb) return [];
  const accessoriesSnapshot = await adminDb.collection('acessorios').orderBy("likedBy.length", "desc").limit(topN).get(); // Approximation if likedBy is array
  // A true sort by array length requires client-side processing or different data model
  const accessoriesList = accessoriesSnapshot.docs.map(d => ({id: d.id, ...d.data()} as Accessory));
  return accessoriesList
    .sort((a,b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0))
    .slice(0, topN)
    .map(acc => ({ id: acc.id, name: acc.name, count: acc.likedBy?.length || 0, imageUrl: acc.imageUrl }));
};
const getMostCommentedAccessories = async (topN: number = 5): Promise<TopAccessoryInfo[]> => {
   if (!adminDb) return [];
  const accessoriesSnapshot = await adminDb.collection('acessorios').get();
  const accessoriesList = accessoriesSnapshot.docs.map(d => ({id: d.id, ...d.data()} as Accessory));
  return accessoriesList
    .map(acc => ({
        ...acc,
        approvedCommentCount: acc.comments?.filter(c => c.status === 'approved').length || 0
    }))
    .sort((a, b) => b.approvedCommentCount - a.approvedCommentCount)
    .slice(0, topN)
    .map(acc => ({ id: acc.id, name: acc.name, count: acc.approvedCommentCount, imageUrl: acc.imageUrl }));
};
const getRecentComments = async (topN: number = 5): Promise<RecentCommentInfo[]> => {
  if (!adminDb) return [];
  const accessoriesSnapshot = await adminDb.collection('acessorios').get();
  const accessoriesList = accessoriesSnapshot.docs.map(d => ({id: d.id, ...d.data()} as Accessory));
  const allApprovedComments: RecentCommentInfo[] = [];
  accessoriesList.forEach(acc => {
    (acc.comments || [])
      .filter(c => c.status === 'approved')
      .forEach(comment => {
        allApprovedComments.push({
          id: comment.id,
          userId: comment.userId,
          userName: comment.userName,
          text: comment.text,
          createdAt: convertTimestampToStringForDisplay(comment.createdAt), 
          status: comment.status,
          accessoryName: acc.name,
          accessoryId: acc.id,
        });
      });
  });
  // @ts-ignore
  return allApprovedComments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) 
    .slice(0, topN);
};

export async function getAnalyticsData(): Promise<AnalyticsData> {
  return {
    totalUsers: await getTotalUsersCount(),
    totalAccessories: await getTotalAccessoriesCount(),
    totalApprovedComments: await getTotalApprovedCommentsCount(),
    accessoriesPerCategory: await getAccessoriesPerCategory(),
    mostLikedAccessories: await getMostLikedAccessories(),
    mostCommentedAccessories: await getMostCommentedAccessories(),
    recentComments: await getRecentComments(),
  };
}

// --- Functions for User Profile Activity Page (Firestore - Client SDK is fine here) ---
export async function getCommentsByUserId(userId: string): Promise<CommentWithAccessoryInfo[]> {
  if (!db) { console.error("Firestore client db instance not available in getCommentsByUserId."); return []; }
  const userComments: CommentWithAccessoryInfo[] = [];
  const allAccessoriesList = await getAllAccessories(); 

  allAccessoriesList.forEach(acc => {
    (acc.comments || [])
      .filter(comment => comment.userId === userId && comment.status === 'approved')
      .forEach(comment => {
        userComments.push({
          id: comment.id,
          userId: comment.userId,
          userName: comment.userName,
          text: comment.text,
          createdAt: convertTimestampToStringForDisplay(comment.createdAt), 
          status: comment.status,
          accessoryId: acc.id,
          accessoryName: acc.name,
        });
      });
  });
  // @ts-ignore
  return userComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAccessoriesLikedByUser(userId: string): Promise<Accessory[]> {
  if (!db) { console.error("Firestore client db instance not available in getAccessoriesLikedByUser."); return []; }
  try {
    const q = query(accessoriesClientCollection, where("likedBy", "array-contains", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Accessory));
  } catch (error) {
    console.error(`Error fetching accessories liked by user ${userId}:`, error);
    return [];
  }
}
