
import type { ComponentType } from 'react';
import type { Timestamp } from 'firebase/firestore';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Timestamp; // Changed to Firestore Timestamp
  status: 'approved' | 'pending_review' | 'rejected';
}

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
  likedBy: string[];
  comments: Comment[]; // Comments will be a subcollection or handled separately
  embedHtml?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: string;
  expiryDate?: Timestamp; // Changed to Firestore Timestamp
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
  followers: string[];
  following: string[];
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
  userCommentsCount: number;
  userLikesCount: number;
  userFollowingCount: number;
  userFollowersCount: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  criteria: (user: UserFirestoreData, data: BadgeCriteriaData) => boolean;
}

export interface PendingCommentDisplay {
  comment: Comment; // Comment object itself
  accessoryId: string;
  accessoryName: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // HTML content
  imageUrl: string;
  imageHint?: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorAvatarHint?: string;
  category?: string;
  tags: string[];
  publishedAt: Timestamp; // Changed to Firestore Timestamp
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

export interface RecentCommentInfo {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string; // Keep as string for display, will be converted from Timestamp
  status: 'approved' | 'pending_review' | 'rejected';
  accessoryName: string;
  accessoryId: string;
}


export interface AnalyticsData {
  totalUsers: number;
  totalAccessories: number;
  totalApprovedComments: number;
  accessoriesPerCategory: CategoryCount[];
  mostLikedAccessories: TopAccessoryInfo[];
  mostCommentedAccessories: TopAccessoryInfo[];
  recentComments: RecentCommentInfo[];
}

// Site Settings Types (remains local)
export interface SocialLinkSetting {
  platform: string;
  label: string;
  url: string;
  IconComponent: ComponentType<{ className?: string }>;
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

// For User Profile Activity
export interface CommentWithAccessoryInfo extends Comment {
  accessoryId: string;
  accessoryName: string;
  // Ensure createdAt is string here if directly used in client component expecting string
  createdAt: string; // Or handle conversion in component
}
