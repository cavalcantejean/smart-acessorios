
import type { ComponentType } from 'react';
import type { Timestamp } from 'firebase/firestore';

// Comment type REMOVED

export interface Accessory {
  id: string;
  name: string;
  imageUrl: string;
  imageHint?: string;
  shortDescription: string;
  fullDescription: string;
  affiliateLink: string;
  price?: string;
  category?: string;
  aiSummary?: string;
  isDeal?: boolean;
  embedHtml?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: string;
  expiryDate?: Timestamp; 
  store?: string;
  applyUrl?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  avatarUrl?: string;
  avatarHint?: string;
  role?: string;
}

export interface UserFirestoreData {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  avatarUrl?: string;
  avatarHint?: string;
  bio?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; 
  imageUrl: string;
  imageHint?: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorAvatarHint?: string;
  category?: string;
  tags: string[];
  publishedAt: Timestamp; 
  embedHtml?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}


// Analytics Types
export interface CategoryCount {
  category: string;
  count: number;
}

export interface TopAccessoryInfo {
  id: string;
  name: string;
  count: number; 
  imageUrl?: string;
}

export interface AnalyticsData {
  totalUsers: number;
  totalAccessories: number;
  accessoriesPerCategory: CategoryCount[];
}

// Site Settings Types
// This type is used for both in-app representation and Firestore storage.
// The IconComponent is only for client-side rendering hints in `data.ts`'s default structure
// and is NOT stored in Firestore.
export interface SocialLinkSetting {
  platform: string;
  label: string;
  url: string; // URL provided by the admin
  placeholderUrl: string; // Example URL for admin UI
  customImageUrl?: string; // Admin-provided custom image URL (data URI or external)
  IconComponent?: ComponentType<{ className?: string }>; // Only for client-side default rendering, NOT stored
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  socialLinks: Array<Omit<SocialLinkSetting, 'IconComponent'>>; // Ensure IconComponent is not part of the stored type
  siteLogoUrl?: string;
  siteFaviconUrl?: string;
}
