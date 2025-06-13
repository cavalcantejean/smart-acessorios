
'use server';

import type { Accessory, Coupon, Testimonial, UserFirestoreData, Post, SiteSettings, SocialLinkSetting, Comment, PendingCommentDisplay } from './types';
import admin from 'firebase-admin';
import { adminDb, adminAuth } from './firebase-admin';
// import { checkAndAwardBadges } from './data'; // Badge system removed
import { defaultSiteSettings as importedDefaultSiteSettings } from './data';

const convertAdminTimestampToISO = (timestamp: admin.firestore.Timestamp | undefined): string | undefined => {
  return timestamp ? timestamp.toDate().toISOString() : undefined;
};

const convertAdminTimestampToStringForDisplay = (timestamp: admin.firestore.Timestamp | undefined): string => {
  return timestamp ? timestamp.toDate().toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : 'N/A';
};

// --- Site Settings (Firestore - Admin SDK) ---
const SITE_SETTINGS_COLLECTION = 'configuracoes';
const SITE_SETTINGS_DOC_ID = 'site_settings_doc';

export async function getSiteSettingsAdmin(): Promise<SiteSettings> {
  if (!adminDb) {
    console.warn("Firebase Admin SDK (adminDb) is not initialized in getSiteSettingsAdmin. Returning default settings.");
    return JSON.parse(JSON.stringify(importedDefaultSiteSettings));
  }
  try {
    const settingsDocRef = adminDb.collection(SITE_SETTINGS_COLLECTION).doc(SITE_SETTINGS_DOC_ID);
    const docSnap = await settingsDocRef.get();

    if (docSnap.exists) {
      const storedData = docSnap.data() as Partial<SiteSettings>;

      const storedSocialLinks: Array<Omit<SocialLinkSetting, 'IconComponent' | 'placeholderUrl'>> =
        storedData.socialLinks?.map(sl => ({
          platform: sl.platform,
          label: sl.label,
          url: sl.url || "",
          customImageUrl: sl.customImageUrl || "",
        })) || [];

      const mergedSocialLinksForStorage = importedDefaultSiteSettings.socialLinks.map(defaultLinkEntry => {
        const storedLinkEntry = storedSocialLinks.find(sl => sl.platform === defaultLinkEntry.platform);
        return {
          platform: defaultLinkEntry.platform,
          label: defaultLinkEntry.label,
          url: storedLinkEntry?.url ?? defaultLinkEntry.url,
          customImageUrl: storedLinkEntry?.customImageUrl ?? defaultLinkEntry.customImageUrl,
        };
      });

      return {
        siteTitle: storedData.siteTitle ?? importedDefaultSiteSettings.siteTitle,
        siteDescription: storedData.siteDescription ?? importedDefaultSiteSettings.siteDescription,
        siteLogoUrl: storedData.siteLogoUrl ?? importedDefaultSiteSettings.siteLogoUrl,
        siteFaviconUrl: storedData.siteFaviconUrl ?? importedDefaultSiteSettings.siteFaviconUrl,
        socialLinks: mergedSocialLinksForStorage,
      };
    } else {
      console.log("Site settings document not found in Firestore (admin). Returning default settings and creating document.");
      await settingsDocRef.set(importedDefaultSiteSettings);
      return JSON.parse(JSON.stringify(importedDefaultSiteSettings));
    }
  } catch (error) {
    console.error("Error fetching site settings from Firestore with Admin SDK:", error);
    return JSON.parse(JSON.stringify(importedDefaultSiteSettings));
  }
}

export async function updateSiteSettingsAdmin(newSettings: Partial<SiteSettings>): Promise<SiteSettings> {
  if (!adminDb) {
    console.error("Firebase Admin SDK (adminDb) is not initialized in updateSiteSettingsAdmin.");
    throw new Error("Admin SDK not initialized.");
  }
  const settingsDocRef = adminDb.collection(SITE_SETTINGS_COLLECTION).doc(SITE_SETTINGS_DOC_ID);
  try {
    const dataToUpdate: Partial<SiteSettings> = {};
    if (newSettings.siteTitle !== undefined) dataToUpdate.siteTitle = newSettings.siteTitle;
    if (newSettings.siteDescription !== undefined) dataToUpdate.siteDescription = newSettings.siteDescription;
    if (newSettings.siteLogoUrl !== undefined) dataToUpdate.siteLogoUrl = newSettings.siteLogoUrl;
    if (newSettings.siteFaviconUrl !== undefined) dataToUpdate.siteFaviconUrl = newSettings.siteFaviconUrl;

    if (newSettings.socialLinks) {
      dataToUpdate.socialLinks = newSettings.socialLinks.map(sl => ({
        platform: sl.platform,
        label: sl.label,
        url: sl.url || "",
        customImageUrl: sl.customImageUrl || "",
      }));
    }

    await settingsDocRef.set(dataToUpdate, { merge: true });
    console.log("Site settings updated successfully in Firestore.");
    return getSiteSettingsAdmin();
  } catch (error) {
    console.error("Error updating site settings in Firestore with Admin SDK:", error);
    throw error;
  }
}


// --- User Management (Admin SDK) ---
export async function toggleUserAdminStatus(userId: string): Promise<UserFirestoreData | null> {
  if (!adminDb) { console.error("Firebase Admin SDK (adminDb) is not initialized in toggleUserAdminStatus."); return null; }
  const userDocRef = adminDb.collection("usuarios").doc(userId);
  try {
    const userDoc = await userDocRef.get();
    if (!userDoc.exists) return null;
    const currentIsAdmin = userDoc.data()?.isAdmin || false;
    await userDocRef.update({ isAdmin: !currentIsAdmin, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    const updatedUserDoc = await userDocRef.get();
    const data = updatedUserDoc.data();
    if (data) {
        return {
            id: updatedUserDoc.id,
            ...data,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        } as UserFirestoreData;
    }
    return null;
  } catch (error) {
    console.error("Error toggling user admin status with Admin SDK:", error);
    return null;
  }
}

// --- Accessory Management (Admin SDK) ---
export async function addAccessoryWithAdmin(accessoryData: Omit<Accessory, 'id' | 'createdAt' | 'updatedAt'> & { isDeal?: boolean }): Promise<Accessory> {
  if (!adminDb) {
    console.error("[Data:addAccessoryWithAdmin] Firebase Admin SDK (adminDb) is not initialized.");
    throw new Error("Firebase Admin SDK (adminDb) is not initialized in addAccessoryWithAdmin.");
  }
  const newAccessoryData = {
    ...accessoryData,
    price: accessoryData.price ? accessoryData.price.toString().replace(',', '.') : null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    category: accessoryData.category || null,
    imageHint: accessoryData.imageHint || null,
    aiSummary: accessoryData.aiSummary || null,
    embedHtml: accessoryData.embedHtml || null,
    isDeal: accessoryData.isDeal || false,
    comments: [], // Initialize comments array
    likedBy: [],  // Initialize likedBy array
  };
  try {
    const docRef = await adminDb.collection('acessorios').add(newAccessoryData);
    const newDocSnap = await docRef.get();
    const createdAccessoryData = newDocSnap.data();
    if (!createdAccessoryData) {
        console.error("[Data:addAccessoryWithAdmin] Failed to fetch newly created accessory document after add.");
        throw new Error("Failed to fetch newly created accessory document.");
    }
    return {
      id: newDocSnap.id,
      ...createdAccessoryData,
    } as Accessory;
  } catch (error: any) {
    console.error("[Data:addAccessoryWithAdmin] Detailed error during addDoc/get (Admin SDK):", error);
    throw error;
  }
}

export async function updateAccessory(accessoryId: string, accessoryData: Partial<Omit<Accessory, 'id'>>): Promise<Accessory | null> {
  if (!adminDb) { console.error("Firebase Admin SDK (adminDb) is not initialized in updateAccessory."); return null; }
  const accessoryDocRef = adminDb.collection("acessorios").doc(accessoryId);
  try {
    const updateData: any = { ...accessoryData, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (updateData.price) updateData.price = updateData.price.toString().replace(',', '.');
    
    // Ensure comments and likedBy are not accidentally overwritten if not provided
    if (updateData.comments === undefined) delete updateData.comments;
    if (updateData.likedBy === undefined) delete updateData.likedBy;


    await accessoryDocRef.update(updateData);
    const updatedDocSnap = await accessoryDocRef.get();
    const updatedData = updatedDocSnap.data();
    if (updatedData) {
        return { id: updatedDocSnap.id, ...updatedData } as Accessory;
    }
    return null;
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

// --- Comment Moderation (Admin SDK) ---
export async function getPendingComments(): Promise<PendingCommentDisplay[]> {
  if (!adminDb) {
    console.error("Firebase Admin SDK (adminDb) is not initialized in getPendingComments.");
    throw new Error("Firebase Admin SDK (adminDb) is not initialized in getPendingComments.");
  }

  const pendingCommentsDisplay: PendingCommentDisplay[] = [];
  try {
    const accessoriesSnapshot = await adminDb.collection('acessorios').get();

    for (const accDoc of accessoriesSnapshot.docs) {
      const accessoryData = accDoc.data() as Accessory;
      if (accessoryData.comments && Array.isArray(accessoryData.comments)) {
        accessoryData.comments.forEach((comment: Comment) => {
          if (comment.status === 'pending_review') {
            let clientComment = { ...comment } as any;
            if (comment.createdAt && typeof (comment.createdAt as any).toDate === 'function') {
               clientComment.createdAt = (comment.createdAt as admin.firestore.Timestamp).toDate().toISOString();
            } else if (typeof comment.createdAt === 'string') {
                // Already a string, do nothing
            } else {
                clientComment.createdAt = new Date().toISOString(); // Fallback
            }

            pendingCommentsDisplay.push({
              comment: clientComment as Comment,
              accessoryId: accDoc.id,
              accessoryName: accessoryData.name || 'Acessório Desconhecido',
            });
          }
        });
      }
    }
  } catch (error) {
    console.error("Error fetching or processing pending comments in data-admin.ts (getPendingComments):", error);
    throw error; 
  }
  return pendingCommentsDisplay.sort((a, b) => new Date(b.comment.createdAt).getTime() - new Date(a.comment.createdAt).getTime());
}

export async function updateCommentStatus(accessoryId: string, commentId: string, newStatus: 'approved' | 'rejected'): Promise<Comment | null> {
  if (!adminDb) {
    console.error("Firebase Admin SDK (adminDb) is not initialized in updateCommentStatus.");
    throw new Error("Admin SDK not initialized.");
  }
  const accessoryDocRef = adminDb.collection("acessorios").doc(accessoryId);
  try {
    const accessoryDoc = await accessoryDocRef.get();
    if (!accessoryDoc.exists) {
      console.error(`Accessory ${accessoryId} not found in updateCommentStatus.`);
      return null;
    }
    const accessoryData = accessoryDoc.data() as Accessory;
    let comments = accessoryData.comments || [];
    let foundComment: Comment | null = null;

    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        foundComment = { ...comment, status: newStatus };
        return foundComment;
      }
      return comment;
    });

    if (!foundComment) {
      console.error(`Comment ${commentId} not found in accessory ${accessoryId}.`);
      return null;
    }

    await accessoryDocRef.update({ comments: updatedComments, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return foundComment;
  } catch (error) {
    console.error(`Error updating comment ${commentId} status for accessory ${accessoryId}:`, error);
    throw error;
  }
}


// --- Coupon Management (Admin SDK) ---
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
  const newDocSnap = await docRef.get();
  const createdCouponData = newDocSnap.data();
   if (!createdCouponData) {
    console.error("[Data:addCoupon] Failed to fetch newly created coupon document after add.");
    throw new Error("Failed to fetch newly created coupon document.");
  }
  return { id: newDocSnap.id, ...createdCouponData } as Coupon;
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
    const updatedDocSnap = await couponDocRef.get();
    const updatedData = updatedDocSnap.data();
    if (updatedData) {
        return { id: updatedDocSnap.id, ...updatedData } as Coupon;
    }
    return null;
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

// --- Post Management (Admin SDK) ---
export async function addPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
  if (!adminDb) {
    console.error("[Data:addPost] Firebase Admin SDK (adminDb) is not initialized.");
    throw new Error("Firebase Admin SDK (adminDb) is not initialized in addPost.");
  }

  const newPostData: any = {
    ...postData,
    publishedAt: postData.publishedAt
                 ? admin.firestore.Timestamp.fromDate(new Date(postData.publishedAt as any))
                 : admin.firestore.Timestamp.now(),
    tags: Array.isArray(postData.tags) ? postData.tags : [],
    embedHtml: postData.embedHtml || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  Object.keys(newPostData).forEach(key => {
    if (newPostData[key] === undefined) {
      delete newPostData[key];
    }
  });

  try {
    const docRef = await adminDb.collection('posts').add(newPostData);
    const newDocSnap = await docRef.get();
    if (!newDocSnap.exists) {
      throw new Error("Newly created post document not found.");
    }
    const createdPostData = newDocSnap.data();
    return {
      id: newDocSnap.id,
      ...createdPostData
    } as Post;
  } catch (error: any) {
    console.error("[Data:addPost] Error during Firestore add/get operation:", error);
    throw error;
  }
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

    Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) delete updateData[key];
    });

    await postDocRef.update(updateData);
    const updatedDocSnap = await postDocRef.get();
    const updatedData = updatedDocSnap.data();
    if(updatedData){
        return { id: updatedDocSnap.id, ...updatedData } as Post;
    }
    return null;
  } catch (error: any) {
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

// Analytics Data (Admin SDK) - Type definition for CategoryCount
interface CategoryCount {
  category: string;
  count: number;
}
// Analytics Data (Admin SDK) - Type definition for AnalyticsData
export interface AnalyticsData {
  totalUsers: number;
  totalAccessories: number;
  accessoriesPerCategory: CategoryCount[];
}


const getTotalUsersCount = async (): Promise<number> => {
  if (!adminDb) {
    console.warn("Firebase Admin SDK (adminDb) is not initialized in getTotalUsersCount. Returning 0.");
    return 0;
  }
  const snapshot = await adminDb.collection("usuarios").count().get();
  return snapshot.data().count;
};
const getTotalAccessoriesCount = async (): Promise<number> => {
  if (!adminDb) {
    console.warn("Firebase Admin SDK (adminDb) is not initialized in getTotalAccessoriesCount. Returning 0.");
    return 0;
  }
  const snapshot = await adminDb.collection("acessorios").count().get();
  return snapshot.data().count;
};

const getAccessoriesPerCategory = async (): Promise<CategoryCount[]> => {
  if (!adminDb) {
    console.warn("Firebase Admin SDK (adminDb) is not initialized in getAccessoriesPerCategory. Returning empty array.");
    return [];
  }
  const accessoriesSnapshot = await adminDb.collection('acessorios').get();
  const accessoriesList = accessoriesSnapshot.docs.map(d => d.data() as Accessory);
  const counts: Record<string, number> = {};
  accessoriesList.forEach(acc => { const category = acc.category || 'Sem Categoria'; counts[category] = (counts[category] || 0) + 1; });
  return Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a,b) => b.count - a.count);
};

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const defaultAnalyticsData: AnalyticsData = {
    totalUsers: 0,
    totalAccessories: 0,
    accessoriesPerCategory: [],
  };

  if (!adminDb) {
    console.warn("Firebase Admin SDK (adminDb) is not initialized in getAnalyticsData. Returning default data.");
    return defaultAnalyticsData;
  }

  try {
    const [totalUsers, totalAccessories, accessoriesPerCategory] = await Promise.all([
      getTotalUsersCount(),
      getTotalAccessoriesCount(),
      getAccessoriesPerCategory(),
    ]);

    return {
      totalUsers,
      totalAccessories,
      accessoriesPerCategory,
    };
  } catch (error) {
    console.error("Error fetching analytics data in getAnalyticsData (data-admin.ts):", error);
    return defaultAnalyticsData;
  }
}
