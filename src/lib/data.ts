
import type { Accessory, Coupon, Testimonial, UserFirestoreData, Post, Comment, BadgeCriteriaData, PendingCommentDisplay, CategoryCount, TopAccessoryInfo, RecentCommentInfo, AnalyticsData, SiteSettings, SocialLinkSetting, CommentWithAccessoryInfo } from './types';
import { allBadges, generateBadgeCriteriaData } from './badges';
import { Facebook, Instagram, Twitter, Film, MessageSquare, Send, MessageCircle, Ghost, AtSign, Mail, Youtube, PlaySquare } from 'lucide-react';
import PinterestIcon from '@/components/icons/PinterestIcon';
import { db } from './firebase';
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
  siteLogoUrl: '', siteFaviconUrl: '',
  socialLinks: [
    { platform: "Facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61575978087535", IconComponent: Facebook, placeholderUrl: "https://facebook.com/seu_usuario", customImageUrl: "" },
    { platform: "Instagram", label: "Instagram", url: "https://www.instagram.com/smart.acessorios", IconComponent: Instagram, placeholderUrl: "https://instagram.com/seu_usuario", customImageUrl: "" },
    { platform: "Twitter", label: "X (Twitter)", url: "https://x.com/Smart_acessorio", IconComponent: Twitter, placeholderUrl: "https://x.com/seu_usuario", customImageUrl: "" },
    { platform: "TikTok", label: "TikTok", url: "https://tiktok.com/@smartacessorio", IconComponent: Film, placeholderUrl: "https://tiktok.com/@seu_usuario", customImageUrl: "" },
    { platform: "WhatsApp", label: "WhatsApp", url: "https://whatsapp.com/channel/0029VbAKxmx5PO18KEZQkJ2V", IconComponent: MessageSquare, placeholderUrl: "https://wa.me/seu_numero_ou_link_canal", customImageUrl: "" },
    { platform: "Pinterest", label: "Pinterest", url: "https://pinterest.com/smartacessorios", IconComponent: PinterestIcon, placeholderUrl: "https://pinterest.com/seu_usuario", customImageUrl: "" },
    { platform: "Telegram", label: "Telegram", url: "https://t.me/smartacessorios", IconComponent: Send, placeholderUrl: "https://t.me/seu_canal", customImageUrl: "" },
    { platform: "Discord", label: "Discord", url: "https://discord.gg/89bwDJWh3y", IconComponent: MessageCircle, placeholderUrl: "https://discord.gg/seu_servidor", customImageUrl: "" },
    { platform: "Snapchat", label: "Snapchat", url: "https://snapchat.com/add/smartacessorios", IconComponent: Ghost, placeholderUrl: "https://snapchat.com/add/seu_usuario", customImageUrl: "" },
    { platform: "Threads", label: "Threads", url: "https://threads.net/@smart.acessorios", IconComponent: AtSign, placeholderUrl: "https://threads.net/@seu_usuario", customImageUrl: "" },
    { platform: "Email", label: "Email", url: "mailto:smartacessori@gmail.com", IconComponent: Mail, placeholderUrl: "mailto:seu_email@example.com", customImageUrl: "" },
    { platform: "YouTube", label: "YouTube", url: "https://youtube.com/@smart.acessorios", IconComponent: Youtube, placeholderUrl: "https://youtube.com/@seu_canal", customImageUrl: "" },
    { platform: "Kwai", label: "Kwai", url: "https://k.kwai.com/u/@SmartAcessorios", IconComponent: PlaySquare, placeholderUrl: "https://k.kwai.com/u/@seu_usuario", customImageUrl: "" }
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


// --- User Management (Firestore) ---
export async function getUserById(id: string): Promise<UserFirestoreData | undefined> {
  if (!db) { console.error("Firestore db instance not available in getUserById."); return undefined; }
  try {
    const userDocRef = doc(db, "usuarios", id);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data();
      return {
        ...data,
        id: userDocSnap.id,
        // Ensure date fields are Timestamps or converted if needed for consistency
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
  if (!db) { console.error("Firestore db instance not available in getAllUsers."); return []; }
  try {
    const usersCollection = collection(db, "usuarios");
    const usersSnapshot = await getDocs(query(usersCollection, orderBy("name")));
    return usersSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as UserFirestoreData));
  } catch (error) {
    console.error("Error fetching all users from Firestore:", error);
    return [];
  }
}

export async function toggleFollowUser(currentUserId: string, targetUserId: string): Promise<{ isFollowing: boolean; targetFollowersCount: number } | null> {
  if (!db) { console.error("Firestore db instance not available in toggleFollowUser."); return null; }
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
        // Unfollow
        transaction.update(currentUserDocRef, { following: arrayRemove(targetUserId), updatedAt: serverTimestamp() });
        transaction.update(targetUserDocRef, { followers: arrayRemove(currentUserId), updatedAt: serverTimestamp() });
        isFollowing = false;
        finalFollowersCount = (targetUserData.followers.length || 1) - 1;
      } else {
        // Follow
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

export async function toggleUserAdminStatus(userId: string): Promise<UserFirestoreData | null> {
  if (!db) { console.error("Firestore db instance not available in toggleUserAdminStatus."); return null; }
  const userDocRef = doc(db, "usuarios", userId);
  try {
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) return null;
    const currentIsAdmin = userDoc.data()?.isAdmin || false;
    await updateDoc(userDocRef, { isAdmin: !currentIsAdmin, updatedAt: serverTimestamp() });
    const updatedUserDoc = await getDoc(userDocRef); // Re-fetch to get updated data
    return { id: updatedUserDoc.id, ...updatedUserDoc.data() } as UserFirestoreData;
  } catch (error) {
    console.error("Error toggling user admin status:", error);
    return null;
  }
}

// --- Accessory Management (Firestore) ---
const accessoriesCollection = collection(db, "acessorios");

export async function getAllAccessories(): Promise<Accessory[]> {
  if (!db) { console.error("Firestore db instance not available in getAllAccessories."); return []; }
  try {
    const accessoriesSnapshot = await getDocs(query(accessoriesCollection, orderBy("createdAt", "desc")));
    return accessoriesSnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
      comments: docSnap.data().comments || [], // Ensure comments is an array
    } as Accessory));
  } catch (error) {
    console.error("Error fetching all accessories from Firestore:", error);
    return [];
  }
}

export async function getAccessoryById(id: string): Promise<Accessory | undefined> {
  if (!db) { console.error("Firestore db instance not available in getAccessoryById."); return undefined; }
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

export async function addAccessory(accessoryData: Omit<Accessory, 'id' | 'likedBy' | 'comments' | 'createdAt' | 'updatedAt'> & { isDeal?: boolean }): Promise<Accessory> {
  if (!db) { throw new Error("Firestore db instance not available in addAccessory."); }
  const newAccessoryData = {
    ...accessoryData,
    price: accessoryData.price ? accessoryData.price.toString().replace(',', '.') : undefined,
    likedBy: [],
    comments: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(accessoriesCollection, newAccessoryData);
  return { id: docRef.id, ...newAccessoryData } as unknown as Accessory; // Cast needed due to serverTimestamp
}

export async function updateAccessory(accessoryId: string, accessoryData: Partial<Omit<Accessory, 'id' | 'likedBy' | 'comments'>>): Promise<Accessory | null> {
  if (!db) { console.error("Firestore db instance not available in updateAccessory."); return null; }
  const accessoryDocRef = doc(db, "acessorios", accessoryId);
  try {
    const updateData = { ...accessoryData, updatedAt: serverTimestamp() };
    if (updateData.price) updateData.price = updateData.price.toString().replace(',', '.');
    await updateDoc(accessoryDocRef, updateData);
    const updatedDoc = await getDoc(accessoryDocRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Accessory;
  } catch (error) {
    console.error(`Error updating accessory ${accessoryId}:`, error);
    return null;
  }
}

export async function deleteAccessory(accessoryId: string): Promise<boolean> {
  if (!db) { console.error("Firestore db instance not available in deleteAccessory."); return false; }
  const accessoryDocRef = doc(db, "acessorios", accessoryId);
  try {
    await deleteDoc(accessoryDocRef);
    // Note: Deleting subcollections (like comments, if they were true subcollections) would require more complex logic.
    // Here, comments are an array field, so they are deleted with the document.
    return true;
  } catch (error) {
    console.error(`Error deleting accessory ${accessoryId}:`, error);
    return false;
  }
}

export async function toggleLikeOnAccessory(accessoryId: string, userId: string): Promise<{ likedBy: string[], likesCount: number } | null> {
  if (!db) { console.error("Firestore db instance not available in toggleLikeOnAccessory."); return null; }
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
  if (!db) { console.error("Firestore db instance not available in addCommentToAccessoryData."); return null; }
  const accessoryDocRef = doc(db, "acessorios", accessoryId);
  try {
    const newComment: Omit<Comment, 'id' | 'createdAt'> & { createdAt: any } = { // createdAt as 'any' for serverTimestamp
      userId,
      userName,
      text,
      status,
      createdAt: serverTimestamp(), // Use Firestore server timestamp
    };

    // Firestore's arrayUnion adds the comment. We need a unique ID if we want to update/delete later.
    // For simplicity in this update, we'll add it to an array. A subcollection is better for scalable comments.
    // For this example, we'll make 'id' part of the comment object stored in the array.
    const commentWithId = { ...newComment, id: doc(collection(db, '_')).id }; // Generate a unique ID for the comment

    await updateDoc(accessoryDocRef, {
      comments: arrayUnion(commentWithId),
      updatedAt: serverTimestamp()
    });

    if (status === 'approved') {
      await checkAndAwardBadges(userId);
    }
    // To return the full comment with resolved timestamp, we'd need to re-fetch or adapt.
    // For now, returning the input structure (with ID) as an approximation.
    // The server timestamp will be resolved on read.
    return { ...commentWithId, createdAt: Timestamp.now() }; // Approximate with client-side now for immediate return
  } catch (error) {
    console.error(`Error adding comment to accessory ${accessoryId}:`, error);
    return null;
  }
}

export async function updateCommentStatus(accessoryId: string, commentId: string, newStatus: 'approved' | 'rejected'): Promise<Comment | null> {
  if (!db) { console.error("Firestore db instance not available in updateCommentStatus."); return null; }
  const accessoryDocRef = doc(db, "acessorios", accessoryId);
  try {
    let updatedCommentData: Comment | null = null;
    await runTransaction(db, async (transaction) => {
      const accessoryDoc = await transaction.get(accessoryDocRef);
      if (!accessoryDoc.exists()) throw "Document does not exist!";
      
      const commentsArray = (accessoryDoc.data()?.comments || []) as Comment[];
      const commentIndex = commentsArray.findIndex(c => c.id === commentId);

      if (commentIndex === -1) throw "Comment not found in array";

      // Create a new array with the updated comment
      const newCommentsArray = commentsArray.map((c, index) =>
        index === commentIndex ? { ...c, status: newStatus, updatedAt: Timestamp.now() } : c // Add/update updatedAt on comment if needed
      );
      
      transaction.update(accessoryDocRef, { comments: newCommentsArray, updatedAt: serverTimestamp() });
      updatedCommentData = newCommentsArray[commentIndex];
    });

    if (updatedCommentData && newStatus === 'approved') {
      await checkAndAwardBadges(updatedCommentData.userId);
    }
    return updatedCommentData;
  } catch (error) {
    console.error(`Error updating status for comment ${commentId} on accessory ${accessoryId}:`, error);
    return null;
  }
}


// --- Utility Functions (may need Firestore integration if they rely on data previously in arrays) ---
export async function getUniqueCategories(): Promise<string[]> {
  const accessoriesList = await getAllAccessories(); // Fetch from Firestore
  const categoriesSet = new Set<string>();
  accessoriesList.forEach(acc => { if (acc.category) categoriesSet.add(acc.category); });
  return Array.from(categoriesSet).sort();
}

export async function getDailyDeals(): Promise<Accessory[]> {
  if (!db) { console.error("Firestore db instance not available in getDailyDeals."); return []; }
  try {
    const dealsQuery = query(accessoriesCollection, where("isDeal", "==", true), orderBy("createdAt", "desc"), limit(6));
    const dealsSnapshot = await getDocs(dealsQuery);
    let deals = dealsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Accessory));
    if (deals.length === 0) { // Fallback if no deals
        const fallbackQuery = query(accessoriesCollection, orderBy("createdAt", "desc"), limit(2));
        const fallbackSnapshot = await getDocs(fallbackQuery);
        deals = fallbackSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Accessory));
    }
    return deals;
  } catch (error) {
    console.error("Error fetching daily deals from Firestore:", error);
    return [];
  }
}

// --- Coupon Management (Firestore) ---
const couponsCollection = collection(db, "cupons");

export async function getCoupons(): Promise<Coupon[]> {
  if (!db) { console.error("Firestore db instance not available in getCoupons."); return []; }
  try {
    const today = Timestamp.now();
    const q = query(couponsCollection, orderBy("expiryDate", "asc")); // Order by expiry to handle nulls later
    const couponsSnapshot = await getDocs(q);
    
    const allCoupons = couponsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Coupon));
    
    // Filter expired client-side as Firestore querying for "expiryDate >= today OR expiryDate IS NULL" is complex
    return allCoupons.filter(coupon => {
      if (!coupon.expiryDate) return true; // No expiry date means active
      return coupon.expiryDate >= today;
    }).sort((a, b) => { // Ensure consistent sort after filter
        if (!a.expiryDate && !b.expiryDate) return 0;
        if (!a.expiryDate) return 1;
        if (!b.expiryDate) return -1;
        return a.expiryDate.toMillis() - b.expiryDate.toMillis();
    });
  } catch (error) {
    console.error("Error fetching coupons from Firestore:", error);
    return [];
  }
}

export async function getCouponById(id: string): Promise<Coupon | undefined> {
   if (!db) { console.error("Firestore db instance not available in getCouponById."); return undefined; }
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
  if (!db) { throw new Error("Firestore db instance not available in addCoupon."); }
  const newCouponData = {
    ...couponData,
    expiryDate: couponData.expiryDate ? Timestamp.fromDate(new Date(couponData.expiryDate as any)) : undefined, // Convert string to Timestamp
    store: couponData.store || undefined,
    applyUrl: couponData.applyUrl || undefined,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(couponsCollection, newCouponData);
  return { id: docRef.id, ...newCouponData } as unknown as Coupon;
}

export async function updateCoupon(couponId: string, couponData: Partial<Omit<Coupon, 'id'>>): Promise<Coupon | null> {
  if (!db) { console.error("Firestore db instance not available in updateCoupon."); return null; }
  const couponDocRef = doc(db, "cupons", couponId);
  try {
    const updateData: Record<string, any> = { ...couponData, updatedAt: serverTimestamp() };
    if (couponData.expiryDate === "") {
        updateData.expiryDate = null; // Or deleteField() if you want to remove it
    } else if (couponData.expiryDate) {
        updateData.expiryDate = Timestamp.fromDate(new Date(couponData.expiryDate as any));
    }
    if (couponData.store === "") updateData.store = null;
    if (couponData.applyUrl === "") updateData.applyUrl = null;

    await updateDoc(couponDocRef, updateData);
    const updatedDoc = await getDoc(couponDocRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Coupon;
  } catch (error) {
    console.error(`Error updating coupon ${couponId}:`, error);
    return null;
  }
}

export async function deleteCoupon(couponId: string): Promise<boolean> {
  if (!db) { console.error("Firestore db instance not available in deleteCoupon."); return false; }
  const couponDocRef = doc(db, "cupons", couponId);
  try {
    await deleteDoc(couponDocRef);
    return true;
  } catch (error) {
    console.error(`Error deleting coupon ${couponId}:`, error);
    return false;
  }
}

// --- Post Management (Firestore) ---
const postsCollection = collection(db, "posts");

export async function getAllPosts(): Promise<Post[]> {
  if (!db) { console.error("Firestore db instance not available in getAllPosts."); return []; }
  try {
    const postsSnapshot = await getDocs(query(postsCollection, orderBy("publishedAt", "desc")));
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
  if (!db) { console.error("Firestore db instance not available in getPostById."); return undefined; }
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
  if (!db) { console.error("Firestore db instance not available in getPostBySlug."); return undefined; }
  try {
    const q = query(postsCollection, where("slug", "==", slug), limit(1));
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
  if (!db) { console.error("Firestore db instance not available in getLatestPosts."); return []; }
  try {
    const q = query(postsCollection, orderBy("publishedAt", "desc"), limit(count));
    const postsSnapshot = await getDocs(q);
    return postsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data(), tags: docSnap.data().tags || [] } as Post));
  } catch (error) {
    console.error("Error fetching latest posts from Firestore:", error);
    return [];
  }
}

export async function addPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
  if (!db) { throw new Error("Firestore db instance not available in addPost."); }
  const newPostData = {
    ...postData,
    publishedAt: postData.publishedAt ? Timestamp.fromDate(new Date(postData.publishedAt as any)) : Timestamp.now(),
    tags: postData.tags || [],
    embedHtml: postData.embedHtml || '',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(postsCollection, newPostData);
  return { id: docRef.id, ...newPostData } as unknown as Post;
}

export async function updatePost(postId: string, postData: Partial<Omit<Post, 'id'>>): Promise<Post | null> {
  if (!db) { console.error("Firestore db instance not available in updatePost."); return null; }
  const postDocRef = doc(db, "posts", postId);
  try {
    const updateData: Record<string, any> = { ...postData, updatedAt: serverTimestamp() };
    if (postData.publishedAt) {
        updateData.publishedAt = Timestamp.fromDate(new Date(postData.publishedAt as any));
    }
    if (postData.tags && !Array.isArray(postData.tags)) { // Assuming tags might come as string from form
        updateData.tags = (postData.tags as unknown as string).split(',').map(t => t.trim()).filter(t => t);
    }
    await updateDoc(postDocRef, updateData);
    const updatedDoc = await getDoc(postDocRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Post;
  } catch (error) {
    console.error(`Error updating post ${postId}:`, error);
    return null;
  }
}

export async function deletePost(postId: string): Promise<boolean> {
  if (!db) { console.error("Firestore db instance not available in deletePost."); return false; }
  const postDocRef = doc(db, "posts", postId);
  try {
    await deleteDoc(postDocRef);
    return true;
  } catch (error) {
    console.error(`Error deleting post ${postId}:`, error);
    return false;
  }
}

// --- Badge System (Needs Firestore integration for user badge updates) ---
export async function checkAndAwardBadges(userId: string): Promise<void> {
  if (!db) { console.error("Firestore db instance not available for badge checking."); return; }
  const user = await getUserById(userId);
  if (!user) { console.warn(`User ${userId} not found for badge checking.`); return; }

  const criteriaData = await generateBadgeCriteriaData(user); // Now async
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
      console.error(`Error updating badges for user ${userId} in Firestore:`, error);
    }
  }
}


// --- Moderation (Firestore) ---
export async function getPendingComments(): Promise<PendingCommentDisplay[]> {
  if (!db) { console.error("Firestore db instance not available in getPendingComments."); return []; }
  const allAccessories = await getAllAccessories();
  const pending: PendingCommentDisplay[] = [];
  allAccessories.forEach(acc => {
    (acc.comments || []).forEach(comment => {
      if (comment.status === 'pending_review') {
        pending.push({
          comment: {
            ...comment,
            // Ensure createdAt is a Firestore Timestamp before further processing
            createdAt: comment.createdAt instanceof Timestamp ? comment.createdAt : Timestamp.fromDate(new Date(comment.createdAt as any)),
          },
          accessoryId: acc.id,
          accessoryName: acc.name,
        });
      }
    });
  });
  // Sort by Firestore Timestamp directly
  return pending.sort((a, b) => b.comment.createdAt.toMillis() - a.comment.createdAt.toMillis());
}


// --- Analytics Data (Firestore) ---
const getTotalUsersCount = async (): Promise<number> => {
  if (!db) return 0;
  const snapshot = await getDocs(collection(db, "usuarios"));
  return snapshot.size;
};
const getTotalAccessoriesCount = async (): Promise<number> => {
  if (!db) return 0;
  const snapshot = await getDocs(accessoriesCollection);
  return snapshot.size;
};
const getTotalApprovedCommentsCount = async (): Promise<number> => {
  const accessoriesList = await getAllAccessories();
  return accessoriesList.reduce((sum, acc) => sum + (acc.comments?.filter(c => c.status === 'approved').length || 0), 0);
};
const getAccessoriesPerCategory = async (): Promise<CategoryCount[]> => {
  const accessoriesList = await getAllAccessories();
  const counts: Record<string, number> = {};
  accessoriesList.forEach(acc => { const category = acc.category || 'Sem Categoria'; counts[category] = (counts[category] || 0) + 1; });
  return Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a,b) => b.count - a.count);
};
const getMostLikedAccessories = async (topN: number = 5): Promise<TopAccessoryInfo[]> => {
  const accessoriesList = await getAllAccessories();
  return [...accessoriesList]
    .sort((a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0))
    .slice(0, topN)
    .map(acc => ({ id: acc.id, name: acc.name, count: acc.likedBy?.length || 0, imageUrl: acc.imageUrl }));
};
const getMostCommentedAccessories = async (topN: number = 5): Promise<TopAccessoryInfo[]> => {
  const accessoriesList = await getAllAccessories();
  return [...accessoriesList]
    .sort((a, b) => (b.comments?.filter(c => c.status === 'approved').length || 0) - (a.comments?.filter(c => c.status === 'approved').length || 0))
    .slice(0, topN)
    .map(acc => ({ id: acc.id, name: acc.name, count: acc.comments?.filter(c => c.status === 'approved').length || 0, imageUrl: acc.imageUrl }));
};
const getRecentComments = async (topN: number = 5): Promise<RecentCommentInfo[]> => {
  const allAccessoriesList = await getAllAccessories();
  const allApprovedComments: RecentCommentInfo[] = [];
  allAccessoriesList.forEach(acc => {
    (acc.comments || [])
      .filter(c => c.status === 'approved')
      .forEach(comment => {
        allApprovedComments.push({
          id: comment.id,
          userId: comment.userId,
          userName: comment.userName,
          text: comment.text,
          createdAt: convertTimestampToStringForDisplay(comment.createdAt), // Convert Timestamp to string for display
          status: comment.status,
          accessoryName: acc.name,
          accessoryId: acc.id,
        });
      });
  });
  return allApprovedComments
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sorting by string date is less reliable, consider original Timestamps before map
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

// --- Functions for User Profile Activity Page (Firestore) ---
export async function getCommentsByUserId(userId: string): Promise<CommentWithAccessoryInfo[]> {
  if (!db) { console.error("Firestore db instance not available in getCommentsByUserId."); return []; }
  const userComments: CommentWithAccessoryInfo[] = [];
  const allAccessoriesList = await getAllAccessories(); // Fetch all accessories

  allAccessoriesList.forEach(acc => {
    (acc.comments || [])
      .filter(comment => comment.userId === userId && comment.status === 'approved')
      .forEach(comment => {
        userComments.push({
          id: comment.id,
          userId: comment.userId,
          userName: comment.userName,
          text: comment.text,
          createdAt: convertTimestampToStringForDisplay(comment.createdAt), // Convert for display
          status: comment.status,
          accessoryId: acc.id,
          accessoryName: acc.name,
        });
      });
  });
  // Sort by original timestamp before conversion for accuracy if possible, or by converted string date
  return userComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAccessoriesLikedByUser(userId: string): Promise<Accessory[]> {
  if (!db) { console.error("Firestore db instance not available in getAccessoriesLikedByUser."); return []; }
  try {
    const q = query(accessoriesCollection, where("likedBy", "array-contains", userId), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as Accessory));
  } catch (error) {
    console.error(`Error fetching accessories liked by user ${userId}:`, error);
    return [];
  }
}
