import type { Accessory, Coupon, Testimonial, UserFirestoreData, Post, SiteSettings, SocialLinkSetting, AnalyticsData as AnalyticsDataTypeFromTypes } from './types'; // Renamed imported AnalyticsData
import admin from 'firebase-admin';
import { adminDb, adminAuth } from './firebase-admin';
import { defaultSiteSettings as importedDefaultSiteSettings } from './site-utils';

// PendingCommentDisplayWithISOStringDate type removed as comments are removed

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
      console.log("Site settings document not found in Firestore (admin). Returning default settings.");
      // For static export, avoid writes during build if Firestore is not fully available or intended for read-only build steps.
      // await settingsDocRef.set(importedDefaultSiteSettings); // Consider if this write is essential.
      return JSON.parse(JSON.stringify(importedDefaultSiteSettings));
    }
  } catch (error) {
    console.error("Error fetching site settings from Firestore with Admin SDK:", error);
    return JSON.parse(JSON.stringify(importedDefaultSiteSettings));
  }
}

export async function getAllPostsAdmin(): Promise<Post[]> {
  if (!adminDb) {
    console.error("Firebase Admin SDK (adminDb) is not initialized in getAllPostsAdmin. Returning empty array.");
    return [];
  }
  try {
    const postsCollectionRef = adminDb.collection('posts');
    // Consider adding orderBy if needed, e.g., orderBy("publishedAt", "desc")
    const postsSnapshot = await postsCollectionRef.orderBy("publishedAt", "desc").get();

    return postsSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        slug: data.slug,
        title: data.title,
        excerpt: data.excerpt,
        content: data.content,
        imageUrl: data.imageUrl,
        imageHint: data.imageHint,
        authorName: data.authorName,
        authorAvatarUrl: data.authorAvatarUrl,
        authorAvatarHint: data.authorAvatarHint,
        category: data.category,
        tags: data.tags || [],
        embedHtml: data.embedHtml,
        // Convert Firestore Timestamps to JS Date objects for consistency with Accessory type handling
        publishedAt: data.publishedAt ? (data.publishedAt as admin.firestore.Timestamp).toDate() : undefined,
        createdAt: data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toDate() : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt as admin.firestore.Timestamp).toDate() : undefined,
      } as Post; // Type assertion
    });
  } catch (error) {
    console.error("Error fetching all posts with Admin SDK:", error);
    return [];
  }
}

export async function getPostByIdAdmin(id: string): Promise<Post | null> {
  if (!adminDb) {
    console.error(`Firebase Admin SDK (adminDb) is not initialized in getPostByIdAdmin for id: ${id}. Returning null.`);
    return null;
  }
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error('getPostByIdAdmin: Invalid ID provided.');
    return null;
  }
  try {
    const postDocRef = adminDb.collection('posts').doc(id);
    const postDocSnap = await postDocRef.get();
    if (postDocSnap.exists) {
      const data = postDocSnap.data();
      if (data) {
        return {
          id: postDocSnap.id,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          imageUrl: data.imageUrl,
          imageHint: data.imageHint,
          authorName: data.authorName,
          authorAvatarUrl: data.authorAvatarUrl,
          authorAvatarHint: data.authorAvatarHint,
          category: data.category,
          tags: data.tags || [],
          embedHtml: data.embedHtml,
          publishedAt: data.publishedAt ? (data.publishedAt as admin.firestore.Timestamp).toDate() : undefined,
          createdAt: data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toDate() : undefined,
          updatedAt: data.updatedAt ? (data.updatedAt as admin.firestore.Timestamp).toDate() : undefined,
        } as Post; // Type assertion
      }
    }
    return null; // Document not found or data is undefined
  } catch (error) {
    console.error(`Error fetching post ${id} with Admin SDK:`, error);
    return null;
  }
}

export async function getPostBySlugAdmin(slug: string): Promise<Post | null> {
  if (!adminDb) {
    console.error(`Firebase Admin SDK (adminDb) is not initialized in getPostBySlugAdmin for slug: ${slug}. Returning null.`);
    return null;
  }
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    console.error('getPostBySlugAdmin: Invalid slug provided.');
    return null;
  }
  try {
    const postsCollectionRef = adminDb.collection('posts');
    const querySnapshot = await postsCollectionRef.where("slug", "==", slug).limit(1).get();

    if (!querySnapshot.empty) {
      const postDocSnap = querySnapshot.docs[0];
      const data = postDocSnap.data();
      if (data) {
        return {
          id: postDocSnap.id,
          slug: data.slug,
          title: data.title,
          excerpt: data.excerpt,
          content: data.content,
          imageUrl: data.imageUrl,
          imageHint: data.imageHint,
          authorName: data.authorName,
          authorAvatarUrl: data.authorAvatarUrl,
          authorAvatarHint: data.authorAvatarHint,
          category: data.category,
          tags: data.tags || [],
          embedHtml: data.embedHtml,
          // Convert Firestore Timestamps to JS Date objects
          publishedAt: data.publishedAt ? (data.publishedAt as admin.firestore.Timestamp).toDate() : undefined,
          createdAt: data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toDate() : undefined,
          updatedAt: data.updatedAt ? (data.updatedAt as admin.firestore.Timestamp).toDate() : undefined,
        } as Post; // Type assertion
      }
    }
    return null; // Document not found or data is undefined
  } catch (error) {
    console.error(`Error fetching post by slug ${slug} with Admin SDK:`, error);
    return null;
  }
}

export async function getAllAccessoriesAdmin(): Promise<Accessory[]> {
  if (!adminDb) {
    console.error("Firebase Admin SDK (adminDb) is not initialized in getAllAccessoriesAdmin. Returning empty array.");
    return [];
  }
  try {
    const accessoriesCollectionRef = adminDb.collection('acessorios');
    // Consider adding orderBy if needed, e.g., orderBy("createdAt", "desc")
    const accessoriesSnapshot = await accessoriesCollectionRef.orderBy("createdAt", "desc").get();

    return accessoriesSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        // Ensure all fields from the Accessory type are mapped
        name: data.name,
        imageUrl: data.imageUrl,
        imageHint: data.imageHint,
        shortDescription: data.shortDescription,
        fullDescription: data.fullDescription,
        affiliateLink: data.affiliateLink,
        price: data.price,
        category: data.category,
        aiSummary: data.aiSummary,
        isDeal: data.isDeal,
        embedHtml: data.embedHtml,
        slug: data.slug,
        // Timestamps need to be converted for consistent Accessory type if not already stored as such.
        // However, for admin functions, returning the raw Firestore Timestamp might be acceptable
        // if the consumer (Server Component) handles it or serializes it.
        // For now, let's assume direct mapping or that data matches Accessory type.
        // If Accessory type expects Date or string, conversion is needed here.
        // For simplicity, this example assumes direct mapping after data() call.
        // If Accessory type has Timestamps from 'firebase/firestore' (client), convert here.
        // If Accessory type expects admin Timestamps, this is fine.
        // The type 'Accessory' uses client Timestamps. Let's convert.
        createdAt: data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toDate() : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt as admin.firestore.Timestamp).toDate() : undefined,
      } as Accessory; // Type assertion might be needed if timestamp conversion isn't perfect for the type
    });
  } catch (error) {
    console.error("Error fetching all accessories with Admin SDK:", error);
    return [];
  }
}

export async function getAccessoryByIdAdmin(id: string): Promise<Accessory | null> {
  if (!adminDb) {
    console.error(`Firebase Admin SDK (adminDb) is not initialized in getAccessoryByIdAdmin for id: ${id}. Returning null.`);
    return null;
  }
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error('getAccessoryByIdAdmin: Invalid ID provided.');
    return null;
  }
  try {
    const accessoryDocRef = adminDb.collection('acessorios').doc(id);
    const accessoryDocSnap = await accessoryDocRef.get();
    if (accessoryDocSnap.exists) {
      const data = accessoryDocSnap.data();
      if (data) {
        return {
          id: accessoryDocSnap.id,
          name: data.name,
          imageUrl: data.imageUrl,
          imageHint: data.imageHint,
          shortDescription: data.shortDescription,
          fullDescription: data.fullDescription,
          affiliateLink: data.affiliateLink,
          price: data.price,
          category: data.category,
          aiSummary: data.aiSummary,
          isDeal: data.isDeal,
          embedHtml: data.embedHtml,
          slug: data.slug,
          createdAt: data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toDate() : undefined,
          updatedAt: data.updatedAt ? (data.updatedAt as admin.firestore.Timestamp).toDate() : undefined,
        } as Accessory;
      }
    }
    return null; // Document not found or data is undefined
  } catch (error) {
    console.error(`Error fetching accessory ${id} with Admin SDK:`, error);
    return null;
  }
}

export async function updateSiteSettingsAdmin(newSettings: Partial<SiteSettings>): Promise<SiteSettings> {
  if (!adminDb) {
    console.error("Firebase Admin SDK (adminDb) is not initialized in updateSiteSettingsAdmin. Operation aborted.");
    throw new Error("Admin SDK (adminDb) not initialized. Cannot update site settings.");
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
    return getSiteSettingsAdmin(); // Re-fetch to confirm
  } catch (error) {
    console.error("Error updating site settings in Firestore with Admin SDK:", error);
    throw error;
  }
}

// --- User Management (Admin SDK) ---
export async function getAllUsersAdmin(): Promise<UserFirestoreData[]> {
  if (!adminDb) {
    console.error("Firebase Admin SDK (adminDb) is not initialized in getAllUsersAdmin. Returning empty array.");
    return [];
  }
  try {
    const usersCollectionRef = adminDb.collection('usuarios');
    const usersSnapshot = await usersCollectionRef.orderBy("name", "asc").get(); // Example ordering

    return usersSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin || false,
        avatarUrl: data.avatarUrl,
        avatarHint: data.avatarHint,
        bio: data.bio,
        createdAt: data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toDate() : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt as admin.firestore.Timestamp).toDate() : undefined,
      } as UserFirestoreData;
    });
  } catch (error) {
    console.error("Error fetching all users with Admin SDK:", error);
    return [];
  }
}

export async function getUserByIdAdmin(id: string): Promise<UserFirestoreData | null> {
  if (!adminDb) {
    console.error(`Firebase Admin SDK (adminDb) is not initialized in getUserByIdAdmin for id: ${id}. Returning null.`);
    return null;
  }
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error('getUserByIdAdmin: Invalid ID provided.');
    return null;
  }
  try {
    const userDocRef = adminDb.collection('usuarios').doc(id);
    const userDocSnap = await userDocRef.get();
    if (userDocSnap.exists) {
      const data = userDocSnap.data();
      if (data) {
        return {
          id: userDocSnap.id,
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin || false,
          avatarUrl: data.avatarUrl,
          avatarHint: data.avatarHint,
          bio: data.bio,
          createdAt: data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toDate() : undefined,
          updatedAt: data.updatedAt ? (data.updatedAt as admin.firestore.Timestamp).toDate() : undefined,
        } as UserFirestoreData;
      }
    }
    return null; // Document not found or data is undefined
  } catch (error) {
    console.error(`Error fetching user ${id} with Admin SDK:`, error);
    return null;
  }
}

export async function toggleUserAdminStatus(userId: string): Promise<UserFirestoreData | null> {
  if (!adminDb || !adminAuth) { 
    console.error("Firebase Admin SDK (adminDb or adminAuth) is not initialized in toggleUserAdminStatus. Operation aborted."); 
    return null; 
  }
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

export async function deleteUserCompletely(userIdToDelete: string, currentAdminId: string): Promise<{ success: boolean; message: string }> {
  if (!adminDb || !adminAuth) {
    const errorMsg = "Firebase Admin SDK não inicializado. Operação de exclusão abortada.";
    console.error(errorMsg);
    return { success: false, message: errorMsg };
  }

  if (userIdToDelete === currentAdminId) {
    return { success: false, message: 'Administradores não podem excluir suas próprias contas.' };
  }

  // Optional: Add a check here if the user to delete is the last admin.
  // This would involve querying all users, filtering for admins, and checking count.
  // For simplicity, this check is often primarily client-side or handled by more complex backend logic/rules.
  // Example (conceptual, needs full implementation if used):
  // const allUsers = await adminAuth.listUsers();
  // const adminUsers = allUsers.users.filter(u => u.customClaims?.admin);
  // if (adminUsers.length === 1 && adminUsers[0].uid === userIdToDelete) {
  //   return { success: false, message: 'Não é possível excluir o último administrador do sistema.' };
  // }


  try {
    // 1. Delete Firebase Authentication record
    await adminAuth.deleteUser(userIdToDelete);
    console.log(`Usuário ${userIdToDelete} excluído da Autenticação Firebase.`);

    // 2. Delete Firestore user document
    const userDocRef = adminDb.collection('usuarios').doc(userIdToDelete);
    await userDocRef.delete();
    console.log(`Documento do usuário ${userIdToDelete} excluído do Firestore.`);

    return { success: true, message: 'Usuário excluído com sucesso da autenticação e do banco de dados.' };

  } catch (error: any) {
    console.error(`Falha ao excluir o usuário ${userIdToDelete}:`, error);

    // More specific error messages based on Firebase error codes if desired
    let userMessage = 'Ocorreu um erro ao excluir o usuário.';
    if (error.code === 'auth/user-not-found') {
      userMessage = 'Usuário não encontrado na Autenticação Firebase. O registro no banco de dados pode ter sido removido se existente.';
      // Attempt to delete Firestore doc anyway if auth user not found, as it might be an orphaned record
      try {
        const userDocRef = adminDb.collection('usuarios').doc(userIdToDelete);
        const docSnap = await userDocRef.get();
        if (docSnap.exists) {
          await userDocRef.delete();
          console.log(`Documento órfão do usuário ${userIdToDelete} excluído do Firestore.`);
        }
      } catch (dbError) {
        console.error(`Erro ao tentar excluir documento órfão ${userIdToDelete} do Firestore:`, dbError);
      }
    } else if (error.code === 'permission-denied') { // Or other relevant codes
        userMessage = 'Permissão negada para excluir o usuário. Verifique as configurações do Firebase Admin SDK.';
    }
    // Check if it's a Firestore error after Auth deletion succeeded (less likely to be caught here if Auth fails first)
    else if (error.message && error.message.includes("Firestore")) {
         userMessage = 'Usuário excluído da autenticação, mas ocorreu um erro ao excluir os dados do Firestore.';
    }

    return { success: false, message: userMessage };
  }
}


// --- Accessory Management (Admin SDK) ---
export async function addAccessoryWithAdmin(accessoryData: Omit<Accessory, 'id' | 'createdAt' | 'updatedAt'> & { isDeal?: boolean }): Promise<Accessory> {
  if (!adminDb) {
    console.error("[Data:addAccessoryWithAdmin] Firebase Admin SDK (adminDb) is not initialized. Operation aborted.");
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
  if (!adminDb) { 
    console.error("Firebase Admin SDK (adminDb) is not initialized in updateAccessory. Operation aborted."); 
    return null; 
  }
  const accessoryDocRef = adminDb.collection("acessorios").doc(accessoryId);
  try {
    const updateData: any = { ...accessoryData, updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (updateData.price) updateData.price = updateData.price.toString().replace(',', '.');
    
    if (updateData.comments !== undefined) {
        console.warn("Attempted to update 'comments' field in updateAccessory (data-admin.ts), but comments system is removed.");
        delete updateData.comments;
    }

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
  if (!adminDb) { 
    console.error("Firebase Admin SDK (adminDb) is not initialized in deleteAccessory. Operation aborted."); 
    return false; 
  }
  const accessoryDocRef = adminDb.collection("acessorios").doc(accessoryId);
  try {
    await accessoryDocRef.delete();
    return true;
  } catch (error) {
    console.error(`Error deleting accessory ${accessoryId} with Admin SDK:`, error);
    return false;
  }
}

// --- Coupon Management (Admin SDK) ---
export async function addCoupon(couponData: Omit<Coupon, 'id' | 'createdAt' | 'updatedAt'>): Promise<Coupon> {
  if (!adminDb) { 
    console.error("Firebase Admin SDK (adminDb) is not initialized in addCoupon. Operation aborted.");
    throw new Error("Firebase Admin SDK (adminDb) is not initialized in addCoupon."); 
  }
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
  if (!adminDb) { 
    console.error("Firebase Admin SDK (adminDb) is not initialized in updateCoupon. Operation aborted."); 
    return null; 
  }
  const couponDocRef = adminDb.collection("cupons").doc(couponId);
  try {
    const updateData: Record<string, any> = { ...couponData, updatedAt: admin.firestore.FieldValue.serverTimestamp() };

    // FIX: Cast expiryDate to 'any' for the string comparison.
    if (couponData.expiryDate as any === "") {
        updateData.expiryDate = null;
    } else if (couponData.expiryDate) {
        // This part correctly handles converting a valid date string/object to a Timestamp.
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
  if (!adminDb) { 
    console.error("Firebase Admin SDK (adminDb) is not initialized in deleteCoupon. Operation aborted."); 
    return false; 
  }
  const couponDocRef = adminDb.collection("cupons").doc(couponId);
  try {
    await couponDocRef.delete();
    return true;
  } catch (error) {
    console.error(`Error deleting coupon ${couponId} with Admin SDK:`, error);
    return false;
  }
}

export async function getAllCouponsAdmin(): Promise<Coupon[]> {
  if (!adminDb) {
    console.error("Firebase Admin SDK (adminDb) is not initialized in getAllCouponsAdmin. Returning empty array.");
    return [];
  }
  try {
    const couponsCollectionRef = adminDb.collection('cupons');
    // Consider adding orderBy if needed, e.g., orderBy("expiryDate", "asc")
    const couponsSnapshot = await couponsCollectionRef.orderBy("createdAt", "desc").get(); // Or order by code, etc.

    return couponsSnapshot.docs.map(docSnap => {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        code: data.code,
        description: data.description,
        discount: data.discount,
        store: data.store,
        applyUrl: data.applyUrl,
        // Convert Firestore Timestamps to JS Date objects
        expiryDate: data.expiryDate ? (data.expiryDate as admin.firestore.Timestamp).toDate() : undefined,
        createdAt: data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toDate() : undefined,
        updatedAt: data.updatedAt ? (data.updatedAt as admin.firestore.Timestamp).toDate() : undefined,
      } as Coupon; // Type assertion
    });
  } catch (error) {
    console.error("Error fetching all coupons with Admin SDK:", error);
    return [];
  }
}

export async function getCouponByIdAdmin(id: string): Promise<Coupon | null> {
  if (!adminDb) {
    console.error(`Firebase Admin SDK (adminDb) is not initialized in getCouponByIdAdmin for id: ${id}. Returning null.`);
    return null;
  }
  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error('getCouponByIdAdmin: Invalid ID provided.');
    return null;
  }
  try {
    const couponDocRef = adminDb.collection('cupons').doc(id);
    const couponDocSnap = await couponDocRef.get();
    if (couponDocSnap.exists) {
      const data = couponDocSnap.data();
      if (data) {
        return {
          id: couponDocSnap.id,
          code: data.code,
          description: data.description,
          discount: data.discount,
          store: data.store,
          applyUrl: data.applyUrl,
          expiryDate: data.expiryDate ? (data.expiryDate as admin.firestore.Timestamp).toDate() : undefined,
          createdAt: data.createdAt ? (data.createdAt as admin.firestore.Timestamp).toDate() : undefined,
          updatedAt: data.updatedAt ? (data.updatedAt as admin.firestore.Timestamp).toDate() : undefined,
        } as Coupon; // Type assertion
      }
    }
    return null; // Document not found or data is undefined
  } catch (error) {
    console.error(`Error fetching coupon ${id} with Admin SDK:`, error);
    return null;
  }
}

// --- Post Management (Admin SDK) ---
export async function addPost(postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>): Promise<Post> {
  if (!adminDb) {
    console.error("[Data:addPost] Firebase Admin SDK (adminDb) is not initialized. Operation aborted.");
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
  if (!adminDb) { 
    console.error("Firebase Admin SDK (adminDb) is not initialized in updatePost. Operation aborted."); 
    return null; 
  }
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
  if (!adminDb) { 
    console.error("Firebase Admin SDK (adminDb) is not initialized in deletePost. Operation aborted."); 
    return false; 
  }
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
interface CategoryCountAnalytics { 
  category: string;
  count: number;
}
// Analytics Data (Admin SDK) - Type definition for AnalyticsData (local to this file)
// Renamed to avoid conflict with AnalyticsData from lib/types
interface AnalyticsDataAdminSDK { 
  totalUsers: number;
  totalAccessories: number;
  accessoriesPerCategory: CategoryCountAnalytics[];
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

const getAccessoriesPerCategory = async (): Promise<CategoryCountAnalytics[]> => {
  if (!adminDb) {
    console.warn("Firebase Admin SDK (adminDb) is not initialized in getAccessoriesPerCategory. Returning empty array.");
    return [];
  }
  const accessoriesSnapshot = await adminDb.collection('acessorios').get();
  const accessoriesList = accessoriesSnapshot.docs.map(d => d.data() as Accessory); // Type cast to client Accessory type
  const counts: Record<string, number> = {};
  accessoriesList.forEach(acc => { const category = acc.category || 'Sem Categoria'; counts[category] = (counts[category] || 0) + 1; });
  return Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a,b) => b.count - a.count);
};

export async function getAnalyticsData(): Promise<AnalyticsDataTypeFromTypes> { // Use the imported type
  const defaultAnalyticsData: AnalyticsDataTypeFromTypes = {
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
    return defaultAnalyticsData; // Return the correctly typed default data
  }
}