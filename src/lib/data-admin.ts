
'use server'; 

import type { Accessory, Coupon, Testimonial, UserFirestoreData, Post, BadgeCriteriaData, CategoryCount, TopAccessoryInfo, AnalyticsData, SiteSettings, SocialLinkSetting } from './types';
// Removed Comment, PendingCommentDisplay, RecentCommentInfo
import admin, { type App as AdminApp } from 'firebase-admin'; 
import { adminDb, adminAuth } from './firebase-admin'; 
import { checkAndAwardBadges } from './data'; 

const convertAdminTimestampToISO = (timestamp: admin.firestore.Timestamp | undefined): string | undefined => {
  return timestamp ? timestamp.toDate().toISOString() : undefined;
};

const convertAdminTimestampToStringForDisplay = (timestamp: admin.firestore.Timestamp | undefined): string => {
  return timestamp ? timestamp.toDate().toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : 'N/A';
};


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

export async function addAccessoryWithAdmin(accessoryData: Omit<Accessory, 'id' | 'createdAt' | 'updatedAt'> & { isDeal?: boolean }): Promise<Accessory> {
  if (!adminDb) {
    console.error("[Data:addAccessoryWithAdmin] Firebase Admin SDK (adminDb) is not initialized.");
    throw new Error("Firebase Admin SDK (adminDb) is not initialized in addAccessoryWithAdmin.");
  }
  const newAccessoryData = {
    ...accessoryData,
    price: accessoryData.price ? accessoryData.price.toString().replace(',', '.') : null,
    // likedBy: [], // REMOVED
    // comments: [], // REMOVED
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    category: accessoryData.category || null,
    imageHint: accessoryData.imageHint || null,
    aiSummary: accessoryData.aiSummary || null,
    embedHtml: accessoryData.embedHtml || null,
    isDeal: accessoryData.isDeal || false,
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
    // Ensure likedBy and comments are not part of accessoryData or remove them
    delete updateData.likedBy;
    delete updateData.comments;

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

// updateCommentStatus REMOVED
// getPendingComments REMOVED

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

export async function addPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
  if (!adminDb) {
    console.error("[Data:addPost] Firebase Admin SDK (adminDb) is not initialized.");
    throw new Error("Firebase Admin SDK (adminDb) is not initialized in addPost.");
  }
  
  console.log("[Data:addPost] Data received for Firestore:", JSON.stringify(postData, null, 2));

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
      console.warn(`[Data:addPost] Removed undefined field: ${key}`);
    }
  });
  
  console.log("[Data:addPost] Data being sent to Firestore add():", JSON.stringify(newPostData, null, 2));

  try {
    const docRef = await adminDb.collection('posts').add(newPostData);
    console.log("[Data:addPost] Document added with ID:", docRef.id);
    
    const newDocSnap = await docRef.get();
    if (!newDocSnap.exists) {
      console.error("[Data:addPost] Newly created post document not found after add. ID:", docRef.id);
      throw new Error("Newly created post document not found.");
    }
    const createdPostData = newDocSnap.data();
    console.log("[Data:addPost] Fetched created post data:", createdPostData);

    return { 
      id: newDocSnap.id, 
      ...createdPostData 
    } as Post; 
  } catch (error: any) {
    console.error("[Data:addPost] Error during Firestore add/get operation:", error);
    if (error.message) console.error("[Data:addPost] Error message:", error.message);
    if (error.stack) console.error("[Data:addPost] Error stack:", error.stack);
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
    if (error.message) console.error(`Error message: ${error.message}`);
    if (error.stack) console.error(`Error stack: ${error.stack}`);
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
// getTotalApprovedCommentsCount REMOVED

const getAccessoriesPerCategory = async (): Promise<CategoryCount[]> => {
  if (!adminDb) return [];
  const accessoriesSnapshot = await adminDb.collection('acessorios').get();
  const accessoriesList = accessoriesSnapshot.docs.map(d => d.data() as Accessory);
  const counts: Record<string, number> = {};
  accessoriesList.forEach(acc => { const category = acc.category || 'Sem Categoria'; counts[category] = (counts[category] || 0) + 1; });
  return Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a,b) => b.count - a.count);
};

// getMostLikedAccessories REMOVED
// getMostCommentedAccessories REMOVED
// getRecentComments REMOVED

export async function getAnalyticsData(): Promise<AnalyticsData> {
  return {
    totalUsers: await getTotalUsersCount(),
    totalAccessories: await getTotalAccessoriesCount(),
    // totalApprovedComments: await getTotalApprovedCommentsCount(), // REMOVED
    accessoriesPerCategory: await getAccessoriesPerCategory(),
    // mostLikedAccessories: await getMostLikedAccessories(), // REMOVED
    // mostCommentedAccessories: await getMostCommentedAccessories(), // REMOVED
    // recentComments: await getRecentComments(), // REMOVED
  };
}
