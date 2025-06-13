
import type { Accessory, Coupon, Testimonial, UserFirestoreData, Post, Comment, BadgeCriteriaData, PendingCommentDisplay, CategoryCount, TopAccessoryInfo, RecentCommentInfo, AnalyticsData, SiteSettings, SocialLinkSetting, CommentWithAccessoryInfo } from './types';
import { allBadges, generateBadgeCriteriaData } from './badges';
import { db } from './firebase'; // SDK Cliente
// REMOVIDO: import { adminDb } from './firebase-admin';
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

    await checkAndAwardBadges(currentUserId);
    await checkAndAwardBadges(targetUserId);
    return { isFollowing, targetFollowersCount: finalFollowersCount };
  } catch (error) {
    console.error("Error in toggleFollowUser transaction:", error);
    return null;
  }
}

// --- Accessory Management (Client SDK for reads and user-initiated writes) ---
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
  if (!db) {
    console.error("[data.ts] Firestore client db instance not available in addCommentToAccessoryData.");
    return null;
  }
  const accessoryDocRef = doc(db, "acessorios", accessoryId);
  try {
    const newComment: Omit<Comment, 'id' | 'createdAt'> & { createdAt: any } = {
      userId,
      userName,
      text,
      status,
      createdAt: serverTimestamp(), // Firestore server-side timestamp
    };
    // Generate a unique ID for the comment client-side for immediate use if needed,
    // Firestore arrayUnion handles the actual addition to the array.
    const commentId = doc(collection(db, '_')).id; // Helper to generate a Firestore-like ID
    const commentWithId = { ...newComment, id: commentId };

    console.log(`[data.ts] Attempting to add comment by user ${userId} to accessory ${accessoryId}. Comment text: ${text.substring(0, 30)}...`);
    await updateDoc(accessoryDocRef, {
      comments: arrayUnion(commentWithId), // Add the comment to the array
      updatedAt: serverTimestamp()
    });
    console.log(`[data.ts] Comment successfully submitted to Firestore for accessory ${accessoryId}. Status: ${status}`);

    if (status === 'approved') {
      await checkAndAwardBadges(userId);
      console.log(`[data.ts] Badges checked for user ${userId} after approved comment.`);
    }
    // Return the comment object with a client-side Timestamp.now() for immediate UI update.
    // The actual 'createdAt' field in Firestore will be the serverTimestamp.
    return { ...commentWithId, createdAt: Timestamp.now() } as Comment;
  } catch (error: any) {
    console.error(`[data.ts] Error adding comment to accessory ${accessoryId} by user ${userId}. Text: ${text.substring(0,30)}...`, error);
    if (error.code) {
      console.error(`[data.ts] Firestore Error Code: ${error.code}`);
    }
    if (error.message) {
      console.error(`[data.ts] Firestore Error Message: ${error.message}`);
    }
    if (error.code === 'permission-denied') {
      console.error("[data.ts] CRITICAL: Firestore permission denied. Check security rules for updating 'acessorios' collection, specifically the 'comments' and 'updatedAt' fields. Authenticated users need write access to these fields to add comments.");
    }
    return null;
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

// --- Post Management (Client SDK for reads) ---
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

// --- Badge System (Client SDK) ---
export async function checkAndAwardBadges(userId: string): Promise<void> {
  if (!db) { console.error("Firestore client db instance not available for badge checking."); return; }
  const user = await getUserById(userId);
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
    const userDocRef = doc(db, "usuarios", userId);
    try {
      await updateDoc(userDocRef, { badges: userBadges, updatedAt: serverTimestamp() });
      console.log(`Badges updated for user ${userId}. New badges: ${userBadges.join(', ')}`);
    } catch (error) {
      console.error(`Error updating badges for user ${userId} in Firestore (client SDK):`, error);
    }
  }
}

// --- Functions for User Profile Activity Page (Client SDK) ---
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
          createdAt: convertTimestampToStringForDisplay(comment.createdAt as Timestamp | undefined),
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
// As funções que usavam adminDb foram removidas deste arquivo.
// Elas devem existir exclusivamente em src/lib/data-admin.ts
// e as Server Actions devem importar delas.

    
    