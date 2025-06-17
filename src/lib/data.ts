
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
import type { ComponentType } from 'react';
import {
  Facebook, Instagram, Twitter, Youtube, Mail, HelpCircle,
  MessageSquare, Send, MessageCircle as DiscordIconLucide, Ghost, AtSign, PlaySquare, Film
} from 'lucide-react';
import PinterestIcon from '@/components/icons/PinterestIcon';


// --- Helper Functions for Firestore ---
const convertTimestampToISO = (timestamp: Timestamp | undefined): string | undefined => {
  return timestamp ? timestamp.toDate().toISOString() : undefined;
};

const convertTimestampToStringForDisplay = (timestamp: Timestamp | undefined): string => {
  return timestamp ? timestamp.toDate().toLocaleDateString('pt-BR', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' }) : 'N/A';
};

// --- Default Site Settings Structure (for storage) ---
const defaultSocialLinksDataForStorage: Array<Omit<SocialLinkSetting, 'IconComponent' | 'placeholderUrl'>> = [
    { platform: "Facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61575978087535", customImageUrl: "" },
    { platform: "Instagram", label: "Instagram", url: "https://www.instagram.com/smart.acessorios", customImageUrl: "" },
    { platform: "Twitter", label: "X (Twitter)", url: "https://x.com/Smart_acessorio", customImageUrl: "" },
    { platform: "TikTok", label: "TikTok", url: "https://tiktok.com/@smartacessorio", customImageUrl: "" },
    { platform: "WhatsApp", label: "WhatsApp", url: "https://whatsapp.com/channel/0029VbAKxmx5PO18KEZQkJ2V", customImageUrl: "" },
    { platform: "Pinterest", label: "Pinterest", url: "https://pinterest.com/smartacessorios", customImageUrl: "" },
    { platform: "Telegram", label: "Telegram", url: "https://t.me/smartacessorios", customImageUrl: "" },
    { platform: "Discord", label: "Discord", url: "https://discord.gg/89bwDJWh3y", customImageUrl: "" },
    { platform: "Snapchat", label: "Snapchat", url: "https://snapchat.com/add/smartacessorios", customImageUrl: "" },
    { platform: "Threads", label: "Threads", url: "https://threads.net/@smart.acessorios", customImageUrl: "" },
    { platform: "Email", label: "Email", url: "mailto:smartacessori@gmail.com", customImageUrl: "" },
    { platform: "YouTube", label: "YouTube", url: "https://youtube.com/@smart.acessorios", customImageUrl: "" },
    { platform: "Kwai", label: "Kwai", url: "https://k.kwai.com/u/@SmartAcessorios", customImageUrl: "" }
];

export const defaultSiteSettings: SiteSettings = {
  siteTitle: 'SmartAcessorios',
  siteDescription: 'Descubra os melhores acessórios para smartphones com links de afiliados e resumos de IA.',
  siteLogoUrl: '',
  siteFaviconUrl: '',
  socialLinks: defaultSocialLinksDataForStorage,
};

// The getSiteSettings function that called getSiteSettingsAdmin has been removed.
// RootLayout now handles fetching admin settings and merging with base social link data.

export function getBaseSocialLinkSettings(): SocialLinkSetting[] {
  return [
    { platform: "Facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61575978087535", placeholderUrl: "https://facebook.com/seu_usuario", IconComponent: Facebook, customImageUrl: "" },
    { platform: "Instagram", label: "Instagram", url: "https://www.instagram.com/smart.acessorios", placeholderUrl: "https://instagram.com/seu_usuario", IconComponent: Instagram, customImageUrl: "" },
    { platform: "Twitter", label: "X (Twitter)", url: "https://x.com/Smart_acessorio", placeholderUrl: "https://x.com/seu_usuario", IconComponent: Twitter, customImageUrl: "" },
    { platform: "TikTok", label: "TikTok", url: "https://tiktok.com/@smartacessorio", placeholderUrl: "https://tiktok.com/@seu_usuario", IconComponent: Film, customImageUrl: "" },
    { platform: "WhatsApp", label: "WhatsApp", url: "https://whatsapp.com/channel/0029VbAKxmx5PO18KEZQkJ2V", placeholderUrl: "https://wa.me/seu_numero_ou_link_canal", IconComponent: MessageSquare, customImageUrl: "" },
    { platform: "Pinterest", label: "Pinterest", url: "https://pinterest.com/smartacessorios", placeholderUrl: "https://pinterest.com/seu_usuario", IconComponent: PinterestIcon, customImageUrl: "" },
    { platform: "Telegram", label: "Telegram", url: "https://t.me/smartacessorios", placeholderUrl: "https://t.me/seu_canal", IconComponent: Send, customImageUrl: "" },
    { platform: "Discord", label: "Discord", url: "https://discord.gg/89bwDJWh3y", placeholderUrl: "https://discord.gg/seu_servidor", IconComponent: DiscordIconLucide, customImageUrl: "" },
    { platform: "Snapchat", label: "Snapchat", url: "https://snapchat.com/add/smartacessorios", placeholderUrl: "https://snapchat.com/add/seu_usuario", IconComponent: Ghost, customImageUrl: "" },
    { platform: "Threads", label: "Threads", url: "https://threads.net/@smart.acessorios", placeholderUrl: "https://threads.net/@seu_usuario", IconComponent: AtSign, customImageUrl: "" },
    { platform: "Email", label: "Email", url: "mailto:smartacessori@gmail.com", placeholderUrl: "mailto:seu_email@example.com", IconComponent: Mail, customImageUrl: "" },
    { platform: "YouTube", label: "YouTube", url: "https://youtube.com/@smart.acessorios", placeholderUrl: "https://youtube.com/@seu_canal", IconComponent: Youtube, customImageUrl: "" },
    { platform: "Kwai", label: "Kwai", url: "https://k.kwai.com/u/@SmartAcessorios", placeholderUrl: "https://k.kwai.com/u/@seu_usuario", IconComponent: PlaySquare, customImageUrl: "" }
  ];
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
const accessoriesClientCollection = collection(db, "acessorios");

export async function getAllAccessories(): Promise<Accessory[]> {
  if (!db) { console.error("Firestore client db instance not available in getAllAccessories."); return []; }
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

// checkAndAwardBadges function removed as badge system is removed.
