
import type { ComponentType } from 'react';
// import type { Timestamp } from 'firebase/firestore'; // No longer needed

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
  slug?: string; // Add this line
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: string;
  expiryDate?: Date | string;
  store?: string;
  applyUrl?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
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
  createdAt?: Date | string;
  updatedAt?: Date | string;
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
  publishedAt?: Date | string;
  embedHtml?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
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
export interface SocialLinkSetting {
  platform: string;
  label: string;
  url: string;
  placeholderUrl: string;
  customImageUrl?: string;
  IconComponent?: ComponentType<{ className?: string }>; // IconComponent is optional
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  socialLinks: Array<Omit<SocialLinkSetting, 'IconComponent' | 'placeholderUrl'>>; 
  siteLogoUrl?: string;
  siteFaviconUrl?: string;
}

// Type for social links that are safe to pass to Client Components
export interface SerializableSocialLinkSetting {
  platform: string;
  label: string;
  url: string;
  placeholderUrl: string; // Keep placeholderUrl if Footer might use it for context
  customImageUrl?: string;
  // IconComponent is deliberately omitted
}

export interface SiteSettingsForClient extends Omit<SiteSettings, 'socialLinks'> {
  socialLinks: SerializableSocialLinkSetting[]; 
}
