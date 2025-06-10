
import type { Accessory, Coupon, Testimonial, UserFirestoreData, Post, Comment, BadgeCriteriaData, PendingCommentDisplay, CategoryCount, TopAccessoryInfo, RecentCommentInfo, AnalyticsData, SiteSettings, SocialLinkSetting, CommentWithAccessoryInfo } from './types';
import { allBadges, generateBadgeCriteriaData } from './badges';
import { Facebook, Instagram, Twitter, Film, MessageSquare, Send, MessageCircle, Ghost, AtSign, Mail, Youtube, PlaySquare } from 'lucide-react';
import PinterestIcon from '@/components/icons/PinterestIcon';
import { db } from './firebase'; // Import db for Firestore operations
import { getDoc, doc } from 'firebase/firestore';


let accessories: Accessory[] = [
  {
    id: '1',
    name: 'Wireless Charging Stand',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'charger stand',
    shortDescription: 'Fast wireless charging for your smartphone.',
    fullDescription: 'Experience the convenience of fast wireless charging with this sleek and modern charging stand. Compatible with all Qi-enabled devices, it offers up to 15W charging speed. Its ergonomic design allows you to use your phone in portrait or landscape mode while charging.',
    affiliateLink: '#',
    price: '29.99',
    category: 'Chargers',
    aiSummary: 'A fast, 15W wireless charging stand with an ergonomic design for Qi-enabled devices, allowing portrait or landscape use during charging.',
    isDeal: true,
    likedBy: ['user-1-mock-id', 'admin-1-mock-id', 'user-2-mock-id'], // Use mock IDs
    comments: [
      { id: 'comment-1-1', userId: 'user-1-mock-id', userName: 'Usuário Comum', text: 'Ótimo carregador, muito prático!', createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'approved' },
      { id: 'comment-1-2', userId: 'user-2-mock-id', userName: 'Outro Usuário', text: 'Precisa de moderação este comentário?', createdAt: new Date(Date.now() - 3600000).toISOString(), status: 'pending_review' },
      { id: 'comment-1-3', userId: 'admin-1-mock-id', userName: 'Administrador', text: 'Concordo, excelente produto.', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'approved' },
    ],
    embedHtml: '<iframe width="560" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
  },
  {
    id: '2',
    name: 'Bluetooth Noise-Cancelling Headphones',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'headphones audio',
    shortDescription: 'Immersive sound with active noise cancellation.',
    fullDescription: 'Dive into a world of pure sound with these Bluetooth headphones featuring active noise cancellation. Enjoy crystal-clear audio, deep bass, and up to 30 hours of playtime on a single charge. Soft memory foam earcups provide all-day comfort.',
    affiliateLink: '#',
    price: '79.50',
    category: 'Audio',
    aiSummary: 'Bluetooth headphones with active noise cancellation, 30-hour playtime, and comfortable memory foam earcups for immersive audio.',
    likedBy: ['user-1-mock-id'],
    comments: [
        { id: 'comment-2-1', userId: 'user-1-mock-id', userName: 'Usuário Comum', text: 'Esse fone é muito bom mas será que meu comentário passa pela moderação?', createdAt: new Date(Date.now() - 7200000).toISOString(), status: 'pending_review' },
        { id: 'comment-2-2', userId: 'user-2-mock-id', userName: 'Outro Usuário', text: 'Cancelamento de ruído funciona bem.', createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), status: 'approved' },
    ],
    embedHtml: '',
  },
  {
    id: '3',
    name: 'Protective Silicone Case',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'phone case',
    shortDescription: 'Slim and durable protection for your device.',
    fullDescription: 'Keep your smartphone safe from drops and scratches with this slim yet durable silicone case. The soft-touch finish provides a comfortable grip, while precise cutouts ensure easy access to all ports and buttons. Available in multiple colors.',
    affiliateLink: '#',
    price: '12.99',
    category: 'Cases',
    isDeal: true,
    likedBy: ['admin-1-mock-id'],
    comments: [
      { id: 'comment-3-1', userId: 'user-1-mock-id', userName: 'Usuário Comum', text: 'Capa bonita e protege bem.', createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), status: 'approved' },
    ],
    embedHtml: '',
  },
  {
    id: '4',
    name: 'Portable Power Bank 10000mAh',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'power bank',
    shortDescription: 'Compact power bank for charging on the go.',
    fullDescription: 'Never run out of battery with this compact 10000mAh portable power bank. It features dual USB ports for charging multiple devices simultaneously and an LED indicator to show remaining power. Small enough to fit in your pocket or bag.',
    affiliateLink: '#',
    price: '22.00',
    category: 'Power Banks',
    aiSummary: 'A compact 10000mAh power bank with dual USB ports and LED indicator for on-the-go charging.',
    likedBy: ['user-1-mock-id', 'admin-1-mock-id'],
    comments: [
       { id: 'comment-4-1', userId: 'admin-1-mock-id', userName: 'Administrador', text: 'Excelente para viagens!', createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), status: 'approved' },
       { id: 'comment-4-2', userId: 'user-2-mock-id', userName: 'Outro Usuário', text: 'Bom custo-benefício.', createdAt: new Date(Date.now() - 3600000 * 5).toISOString(), status: 'approved' },
    ],
    embedHtml: '',
  },
   {
    id: '5',
    name: 'Gaming Mouse RGB',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'gaming mouse',
    shortDescription: 'High-precision gaming mouse with customizable RGB lighting.',
    fullDescription: 'Dominate your games with this high-precision gaming mouse. Featuring an adjustable DPI sensor, programmable buttons, and customizable RGB lighting, it offers both performance and style. Ergonomically designed for comfort during long gaming sessions.',
    affiliateLink: '#',
    price: '45.90',
    category: 'Peripherals',
    aiSummary: 'High-precision gaming mouse with adjustable DPI, programmable buttons, and RGB lighting for performance and style.',
    likedBy: ['user-2-mock-id'],
    comments: [],
    embedHtml: '',
  },
  {
    id: '6',
    name: 'Smartwatch Fitness Tracker',
    imageUrl: 'https://placehold.co/600x400.png',
    imageHint: 'smartwatch fitness',
    shortDescription: 'Track your fitness and receive notifications on your wrist.',
    fullDescription: 'Stay on top of your health and connected with this smartwatch fitness tracker. Monitors heart rate, sleep, steps, and various workouts. Receive notifications for calls, messages, and apps directly on your wrist. Long-lasting battery and water-resistant design.',
    affiliateLink: '#',
    price: '59.99',
    category: 'Wearables',
    isDeal: true,
    likedBy: ['user-1-mock-id', 'user-2-mock-id', 'admin-1-mock-id'],
    comments: [
       { id: 'comment-6-1', userId: 'user-1-mock-id', userName: 'Usuário Comum', text: 'Adorei o smartwatch, muito útil!', createdAt: new Date(Date.now() - 3600000 * 10).toISOString(), status: 'approved' },
    ],
    embedHtml: '',
  }
];

let coupons: Coupon[] = [
  { id: 'coupon1', code: 'SUMMER20', description: 'Get 20% off on all summer accessories.', discount: '20% OFF', expiryDate: '2024-08-31', store: 'AccessoryStore', applyUrl: 'https://example.com/store/summer-sale' },
  { id: 'coupon2', code: 'AUDIOFUN', description: '15% discount on headphones and speakers.', discount: '15% OFF', expiryDate: '2024-09-15', store: 'SoundGoodies', applyUrl: 'https://example.com/audio' },
  { id: 'coupon3', code: 'FREESHIP', description: 'Free shipping on orders over R$50.', discount: 'Free Shipping', store: 'GadgetHub' },
];

const testimonials: Testimonial[] = [
  { id: 'testimonial1', name: 'Ana Silva', quote: 'Encontrei os melhores acessórios aqui! A seleção de ofertas do dia é incrível e os resumos de IA me ajudam a decidir rapidamente. Recomendo!', role: 'Cliente Satisfeita', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'woman portrait' },
  { id: 'testimonial2', name: 'Carlos Pereira', quote: 'Os cupons promocionais são ótimos! Consegui um bom desconto na minha última compra de fones de ouvido. O site é fácil de navegar.', role: 'Entusiasta de Gadgets', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'man portrait' },
  { id: 'testimonial3', name: 'Juliana Costa', quote: 'Adoro a variedade de produtos e a clareza das descrições. A funcionalidade de favoritar é muito útil para salvar itens que quero comprar depois.', role: 'Compradora Online', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'person smiling' }
];

// Mock users are for initial data or for non-Firebase Auth related user info display.
// Passwords are no longer stored here. User creation is handled by Firebase Auth.
export let mockUsers: UserFirestoreData[] = [
  { id: 'user-1-mock-id', name: 'Usuário Comum', email: 'user@example.com', isAdmin: false, followers: ['admin-1-mock-id'], following: ['admin-1-mock-id'], avatarUrl: 'https://placehold.co/150x150.png', avatarHint: 'user avatar', bio: 'Apenas um usuário comum explorando o mundo dos acessórios!', badges: [] },
  { id: 'admin-1-mock-id', name: 'Administrador', email: 'admin@example.com', isAdmin: true, followers: ['user-1-mock-id'], following: ['user-1-mock-id', 'user-2-mock-id'], avatarUrl: 'https://placehold.co/150x150.png', avatarHint: 'admin avatar', bio: 'Gerenciando a plataforma SmartAcessorios.', badges: [] },
  { id: 'user-2-mock-id', name: 'Outro Usuário', email: 'existing@example.com', isAdmin: false, followers: ['admin-1-mock-id'], following: [], avatarUrl: 'https://placehold.co/150x150.png', avatarHint: 'another user', bio: 'Entusiasta de tecnologia e gadgets.', badges: [] },
];

let mockPosts: Post[] = [
  { id: 'post-1', slug: 'guia-completo-para-carregadores-sem-fio', title: 'Guia Completo para Carregadores Sem Fio: Tudo o que Você Precisa Saber', excerpt: 'Descubra como funcionam os carregadores sem fio, os diferentes tipos disponíveis e como escolher o melhor para o seu smartphone.', content: '<p>Conteúdo do post sobre carregadores...</p>', imageUrl: 'https://placehold.co/800x450.png', imageHint: 'blog wireless charging', authorName: 'Equipe SmartAcessorios', authorAvatarUrl: 'https://placehold.co/100x100.png', authorAvatarHint: 'team avatar', category: 'Tecnologia', tags: ['carregadores sem fio', 'Qi'], publishedAt: '2024-07-28T10:00:00Z', embedHtml: '<iframe width="560" height="315" src="https://www.youtube.com/embed/vCHy4qF1xSY" allowfullscreen></iframe>', },
  { id: 'post-2', slug: '5-acessorios-essenciais-para-seu-smartphone-em-2024', title: '5 Acessórios Essenciais para seu Smartphone em 2024', excerpt: 'Maximizando a utilidade do seu smartphone com os acessórios certos.', content: '<p>Conteúdo do post sobre 5 acessórios...</p>', imageUrl: 'https://placehold.co/800x450.png', imageHint: 'blog smartphone accessories', authorName: 'Redação Tech', authorAvatarUrl: 'https://placehold.co/100x100.png', authorAvatarHint: 'tech writer', category: 'Dicas', tags: ['acessórios', 'dicas'], publishedAt: '2024-07-25T14:30:00Z', embedHtml: '', },
  { id: 'post-3', slug: 'entendendo-as-diferencas-entre-cabos-usb-c', title: 'Entendendo as Diferenças Entre Cabos USB-C', excerpt: 'Nem todos os cabos USB-C são iguais. Aprenda a identificar o cabo certo.', content: '<p>Conteúdo do post sobre cabos USB-C...</p>', imageUrl: 'https://placehold.co/800x450.png', imageHint: 'blog usb c cables', authorName: 'Dr. Conecta', authorAvatarUrl: 'https://placehold.co/100x100.png', authorAvatarHint: 'tech expert', category: 'Guias', tags: ['USB-C', 'cabos'], publishedAt: '2024-07-22T09:15:00Z', embedHtml: '', }
];

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

// This function will now fetch from Firestore. The mockUsers array is for fallback or initial display.
// In a real app, you'd likely remove mockUsers or use it only if Firestore fetch fails.
export async function getUserById(id: string): Promise<UserFirestoreData | undefined> {
  if (!db) {
    console.warn("Firestore db instance not available in getUserById. Falling back to mock data.");
    return mockUsers.find(user => user.id === id);
  }
  try {
    const userDocRef = doc(db, "usuarios", id);
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      return userDocSnap.data() as UserFirestoreData;
    } else {
      console.warn(`User document with ID ${id} not found in Firestore. Checking mock data.`);
      return mockUsers.find(user => user.id === id); // Fallback for existing mock data
    }
  } catch (error) {
    console.error("Error fetching user from Firestore in getUserById:", error);
    return mockUsers.find(user => user.id === id); // Fallback on error
  }
}

// Kept for internal use if needed for other parts of the app, but not for auth.
export function getUserByEmail(email: string): UserFirestoreData | undefined {
  const lowercasedEmail = email.toLowerCase();
  return mockUsers.find(user => user.email.toLowerCase() === lowercasedEmail);
}

export function getAllAccessories(): Accessory[] { return accessories.map(acc => ({ ...acc, comments: Array.isArray(acc.comments) ? acc.comments : [] })); }
export function getAccessoryById(id: string): Accessory | undefined {
  const accessory = accessories.find(acc => acc.id === id);
  return accessory ? { ...accessory, comments: Array.isArray(accessory.comments) ? accessory.comments : [] } : undefined;
}

export function toggleLikeOnAccessory(accessoryId: string, userId: string): { likedBy: string[], likesCount: number } | null {
  const accessoryIndex = accessories.findIndex(acc => acc.id === accessoryId);
  if (accessoryIndex === -1) return null;
  const accessory = accessories[accessoryIndex];
  accessory.likedBy = accessory.likedBy || [];
  const userIndex = accessory.likedBy.indexOf(userId);
  if (userIndex > -1) accessory.likedBy.splice(userIndex, 1);
  else accessory.likedBy.push(userId);
  accessories[accessoryIndex] = { ...accessory };
  checkAndAwardBadges(userId); 
  return { likedBy: [...accessory.likedBy], likesCount: accessory.likedBy.length };
}

export function addCommentToAccessoryData(accessoryId: string, userId: string, userName: string, text: string, status: 'approved' | 'pending_review' | 'rejected' = 'approved'): Comment | null {
  const accessoryIndex = accessories.findIndex(acc => acc.id === accessoryId);
  if (accessoryIndex === -1) return null;
  if (!Array.isArray(accessories[accessoryIndex].comments)) accessories[accessoryIndex].comments = [];
  const newComment: Comment = { id: `comment-${accessoryId}-${Date.now()}`, userId, userName, text, createdAt: new Date().toISOString(), status, };
  accessories[accessoryIndex].comments.push(newComment);
  accessories[accessoryIndex] = { ...accessories[accessoryIndex], comments: [...accessories[accessoryIndex].comments] };
  if (status === 'approved') checkAndAwardBadges(userId);
  return newComment;
}

export function getUniqueCategories(): string[] {
  const categoriesSet = new Set<string>();
  accessories.forEach(acc => { if (acc.category) categoriesSet.add(acc.category); });
  return Array.from(categoriesSet).sort();
}
export function getDailyDeals(): Accessory[] {
  const deals = accessories.filter(acc => acc.isDeal);
  return deals.length > 0 ? deals : accessories.slice(0, 2).map(acc => ({ ...acc }));
}
export function getCoupons(): Coupon[] { return [...coupons].sort((a, b) => { if (!a.expiryDate && !b.expiryDate) return 0; if (!a.expiryDate) return 1; if (!b.expiryDate) return -1; return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime(); }); }
export function getCouponById(id: string): Coupon | undefined { return coupons.find(c => c.id === id); }
export function addCoupon(couponData: Omit<Coupon, 'id'>): Coupon {
  const newCoupon: Coupon = { id: `coupon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, ...couponData, expiryDate: couponData.expiryDate || undefined, store: couponData.store || undefined, applyUrl: couponData.applyUrl || undefined, };
  coupons.unshift(newCoupon); return newCoupon;
}
export function updateCoupon(couponId: string, couponData: Partial<Omit<Coupon, 'id'>>): Coupon | null {
  const couponIndex = coupons.findIndex(c => c.id === couponId);
  if (couponIndex === -1) return null;
  const updatedCoupon = { ...coupons[couponIndex], ...couponData, expiryDate: couponData.expiryDate === "" ? undefined : (couponData.expiryDate || coupons[couponIndex].expiryDate), store: couponData.store === "" ? undefined : (couponData.store || coupons[couponIndex].store), applyUrl: couponData.applyUrl === "" ? undefined : (couponData.applyUrl || coupons[couponIndex].applyUrl), };
  coupons[couponIndex] = updatedCoupon; return updatedCoupon;
}
export function deleteCoupon(couponId: string): boolean { const initialLength = coupons.length; coupons = coupons.filter(c => c.id !== couponId); return coupons.length < initialLength; }
export function getTestimonials(): Testimonial[] { return testimonials; }
export function getAllPosts(): Post[] { return mockPosts.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()); }
export function getPostById(id: string): Post | undefined { return mockPosts.find(post => post.id === id); }
export function getPostBySlug(slug: string): Post | undefined { return mockPosts.find(post => post.slug === slug); }
export function getLatestPosts(count: number): Post[] { return getAllPosts().slice(0, count); }
export function addPost(postData: Omit<Post, 'id'>): Post {
  const newPost: Post = { id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, ...postData, publishedAt: postData.publishedAt && !isNaN(new Date(postData.publishedAt).getTime()) ? new Date(postData.publishedAt).toISOString() : new Date().toISOString(), tags: postData.tags || [], embedHtml: postData.embedHtml || '', };
  mockPosts.unshift(newPost); return newPost;
}
export function updatePost(postId: string, postData: Partial<Omit<Post, 'id'>>): Post | null {
  const postIndex = mockPosts.findIndex(p => p.id === postId);
  if (postIndex === -1) return null;
  const updatedPost = { ...mockPosts[postIndex], ...postData, embedHtml: postData.embedHtml !== undefined ? postData.embedHtml : mockPosts[postIndex].embedHtml, };
  if (postData.publishedAt && !isNaN(new Date(postData.publishedAt).getTime())) { updatedPost.publishedAt = new Date(postData.publishedAt).toISOString(); } else if (postData.publishedAt) { updatedPost.publishedAt = mockPosts[postIndex].publishedAt; }
  mockPosts[postIndex] = updatedPost; return updatedPost;
}
export function deletePost(postId: string): boolean { const initialLength = mockPosts.length; mockPosts = mockPosts.filter(p => p.id !== postId); return mockPosts.length < initialLength; }

export async function toggleFollowUser(currentUserId: string, targetUserId: string): Promise<{ isFollowing: boolean; targetFollowersCount: number } | null> {
  // This function now needs to update Firestore documents.
  // For simplicity, this mock will continue to update the mockUsers array.
  // A real implementation would use Firestore transactions.
  const currentUserIndex = mockUsers.findIndex(u => u.id === currentUserId);
  const targetUserIndex = mockUsers.findIndex(u => u.id === targetUserId);

  if (currentUserIndex === -1 || targetUserIndex === -1 || currentUserId === targetUserId) return null;

  const currentUser = mockUsers[currentUserIndex];
  const targetUser = mockUsers[targetUserIndex];
  currentUser.following = currentUser.following || [];
  targetUser.followers = targetUser.followers || [];
  const isCurrentlyFollowing = currentUser.following.includes(targetUserId);

  if (isCurrentlyFollowing) {
    currentUser.following = currentUser.following.filter(id => id !== targetUserId);
    targetUser.followers = targetUser.followers.filter(id => id !== currentUserId);
  } else {
    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);
  }
  mockUsers[currentUserIndex] = { ...currentUser };
  mockUsers[targetUserIndex] = { ...targetUser };
  await checkAndAwardBadges(currentUserId); // Made async due to getUserById
  await checkAndAwardBadges(targetUserId); // Made async
  return { isFollowing: !isCurrentlyFollowing, targetFollowersCount: targetUser.followers.length, };
}

export async function checkAndAwardBadges(userId: string): Promise<void> {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) { console.warn(`Mock user ${userId} not found for badge checking.`); return; }
  
  let user = mockUsers[userIndex]; // This is from mock data
  // In a real app, you'd fetch the user's latest data from Firestore here if needed
  // For badge criteria based on Firestore fields, ensure 'user' reflects that.
  
  user.badges = Array.isArray(user.badges) ? user.badges : [];
  const criteriaData = generateBadgeCriteriaData(user); // Pass UserFirestoreData
  let badgesUpdated = false;
  allBadges.forEach(badge => {
    if (!user.badges?.includes(badge.id) && badge.criteria(user, criteriaData)) {
      user.badges?.push(badge.id);
      badgesUpdated = true;
    }
  });
  if (badgesUpdated) mockUsers[userIndex] = { ...user, badges: [...(user.badges || [])] };
}

// This now fetches all users from mock data. 
// A real app would fetch from Firestore, potentially with pagination.
export function getAllUsers(): UserFirestoreData[] { return mockUsers.map(user => ({ ...user, badges: user.badges || [] })); }

export function toggleUserAdminStatus(userId: string): UserFirestoreData | null {
  const userIndex = mockUsers.findIndex(u => u.id === userId);
  if (userIndex === -1) return null;
  mockUsers[userIndex].isAdmin = !mockUsers[userIndex].isAdmin;
  mockUsers[userIndex] = { ...mockUsers[userIndex] };
  // In a real app, you'd update the isAdmin field in Firestore here.
  // e.g., await updateDoc(doc(db, "usuarios", userId), { isAdmin: mockUsers[userIndex].isAdmin });
  return mockUsers[userIndex];
}

export function getPendingComments(): PendingCommentDisplay[] {
  const pending: PendingCommentDisplay[] = [];
  accessories.forEach(acc => { (acc.comments || []).forEach(comment => { if (comment.status === 'pending_review') { pending.push({ comment: { ...comment }, accessoryId: acc.id, accessoryName: acc.name, }); } }); });
  return pending.sort((a, b) => new Date(b.comment.createdAt).getTime() - new Date(a.comment.createdAt).getTime());
}
export function updateCommentStatus(accessoryId: string, commentId: string, newStatus: 'approved' | 'rejected'): Comment | null {
  const accessoryIndex = accessories.findIndex(acc => acc.id === accessoryId);
  if (accessoryIndex === -1) return null;
  const accessory = accessories[accessoryIndex];
  if (!accessory.comments) return null;
  const commentIndex = accessory.comments.findIndex(c => c.id === commentId);
  if (commentIndex === -1) return null;
  accessory.comments[commentIndex].status = newStatus;
  const updatedComment = { ...accessory.comments[commentIndex] };
  const updatedComments = [...accessory.comments]; updatedComments[commentIndex] = updatedComment;
  accessories[accessoryIndex] = { ...accessory, comments: updatedComments };
  if (newStatus === 'approved') checkAndAwardBadges(updatedComment.userId);
  return updatedComment;
}

const getTotalUsersCount = (): number => mockUsers.length; // This should reflect actual users in Firestore for real analytics
const getTotalAccessoriesCount = (): number => accessories.length;
const getTotalApprovedCommentsCount = (): number => accessories.reduce((sum, acc) => sum + (acc.comments?.filter(c => c.status === 'approved').length || 0), 0);
const getAccessoriesPerCategory = (): CategoryCount[] => { const counts: Record<string, number> = {}; accessories.forEach(acc => { const category = acc.category || 'Sem Categoria'; counts[category] = (counts[category] || 0) + 1; }); return Object.entries(counts).map(([category, count]) => ({ category, count })).sort((a,b) => b.count - a.count); };
const getMostLikedAccessories = (limit: number = 5): TopAccessoryInfo[] => [...accessories].sort((a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0)).slice(0, limit).map(acc => ({ id: acc.id, name: acc.name, count: acc.likedBy?.length || 0, imageUrl: acc.imageUrl, }));
const getMostCommentedAccessories = (limit: number = 5): TopAccessoryInfo[] => [...accessories].sort((a, b) => (b.comments?.filter(c => c.status === 'approved').length || 0) - (a.comments?.filter(c => c.status === 'approved').length || 0)).slice(0, limit).map(acc => ({ id: acc.id, name: acc.name, count: acc.comments?.filter(c => c.status === 'approved').length || 0, imageUrl: acc.imageUrl, }));
const getRecentComments = (limit: number = 5): RecentCommentInfo[] => { const allApprovedComments: RecentCommentInfo[] = []; accessories.forEach(acc => { (acc.comments || []).filter(c => c.status === 'approved').forEach(comment => allApprovedComments.push({ ...comment, accessoryName: acc.name, accessoryId: acc.id, })); }); return allApprovedComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, limit); };
export async function getAnalyticsData(): Promise<AnalyticsData> { return { totalUsers: getTotalUsersCount(), totalAccessories: getTotalAccessoriesCount(), totalApprovedComments: getTotalApprovedCommentsCount(), accessoriesPerCategory: getAccessoriesPerCategory(), mostLikedAccessories: getMostLikedAccessories(), mostCommentedAccessories: getMostCommentedAccessories(), recentComments: getRecentComments(), }; }
export function addAccessory(accessoryData: Omit<Accessory, 'id' | 'likedBy' | 'comments' | 'isDeal'> & { isDeal?: boolean }): Accessory { const newAccessory: Accessory = { id: `acc-${Date.now()}`, name: accessoryData.name, imageUrl: accessoryData.imageUrl, imageHint: accessoryData.imageHint, shortDescription: accessoryData.shortDescription, fullDescription: accessoryData.fullDescription, affiliateLink: accessoryData.affiliateLink, price: accessoryData.price ? accessoryData.price.toString().replace(',', '.') : undefined, category: accessoryData.category, aiSummary: accessoryData.aiSummary, isDeal: accessoryData.isDeal ?? false, likedBy: [], comments: [], embedHtml: accessoryData.embedHtml, }; accessories.unshift(newAccessory); return newAccessory; }
export function updateAccessory(accessoryId: string, accessoryData: Partial<Omit<Accessory, 'id' | 'likedBy' | 'comments'>>): Accessory | null {
  const accessoryIndex = accessories.findIndex(acc => acc.id === accessoryId);
  if (accessoryIndex === -1) return null;
  const updatedAccessoryData = { ...accessoryData };
  if (updatedAccessoryData.price) updatedAccessoryData.price = updatedAccessoryData.price.toString().replace(',', '.');
  accessories[accessoryIndex] = { ...accessories[accessoryIndex], ...updatedAccessoryData, embedHtml: accessoryData.embedHtml !== undefined ? accessoryData.embedHtml : accessories[accessoryIndex].embedHtml, };
  return accessories[accessoryIndex];
}
export function deleteAccessory(accessoryId: string): boolean { const initialLength = accessories.length; accessories = accessories.filter(acc => acc.id !== accessoryId); return accessories.length < initialLength; }

// Functions for Recent Activity on User Profile
export function getCommentsByUserId(userId: string): CommentWithAccessoryInfo[] {
  const userComments: CommentWithAccessoryInfo[] = [];
  accessories.forEach(acc => {
    (acc.comments || [])
      .filter(comment => comment.userId === userId && comment.status === 'approved')
      .forEach(comment => {
        userComments.push({
          ...comment,
          accessoryId: acc.id,
          accessoryName: acc.name,
        });
      });
  });
  return userComments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAccessoriesLikedByUser(userId: string): Accessory[] {
  // Note: This doesn't sort by recency of like, as like timestamps are not stored.
  // It returns all accessories liked by the user.
  return accessories.filter(acc => acc.likedBy.includes(userId));
}
