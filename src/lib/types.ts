
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
  // likedBy: string[]; // REMOVED
  // comments: Comment[]; // REMOVED
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
  // followers: string[]; // REMOVED
  // following: string[]; // REMOVED
  avatarUrl?: string;
  avatarHint?: string;
  bio?: string;
  badges?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AuthUser {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
}

export interface BadgeCriteriaData {
  // userCommentsCount: number; // REMOVED
  // userLikesCount: number; // REMOVED
  // userFollowingCount: number; // REMOVED
  // userFollowersCount: number; // REMOVED
  // Add other criteria data points here if new badges require them
  placeholder?: boolean; // Added placeholder as all criteria were removed
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  criteria: (user: UserFirestoreData, data: BadgeCriteriaData) => boolean;
}

// PendingCommentDisplay type REMOVED
// CommentWithAccessoryInfo type REMOVED


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
  count: number; // This will now be for other metrics if TopItemsList is reused, or this type might become unused.
  imageUrl?: string;
}

// RecentCommentInfo type REMOVED

export interface AnalyticsData {
  totalUsers: number;
  totalAccessories: number;
  // totalApprovedComments: number; // REMOVED
  accessoriesPerCategory: CategoryCount[];
  // mostLikedAccessories: TopAccessoryInfo[]; // REMOVED
  // mostCommentedAccessories: TopAccessoryInfo[]; // REMOVED
  // recentComments: RecentCommentInfo[]; // REMOVED
}

// Site Settings Types (remains local)
export interface SocialLinkSetting {
  platform: string;
  label: string;
  url: string;
  placeholderUrl: string;
  customImageUrl?: string;
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  socialLinks: SocialLinkSetting[];
  siteLogoUrl?: string;
  siteFaviconUrl?: string;
}

