
import type { ComponentType } from 'react';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string; // ISO date string
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
  likedBy: string[]; // Array of user IDs who liked this accessory
  comments: Comment[];
  embedHtml?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: string;
  expiryDate?: string;
  store?: string; // Optional: name of the store or brand
  applyUrl?: string; // Optional: URL where the coupon can be applied
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  avatarUrl?: string;
  avatarHint?: string;
  role?: string;
}

// User data as stored in Firestore
export interface UserFirestoreData {
  id: string; // Should match Firebase Auth UID
  name: string;
  email: string; // Stored for querying or display, but Auth is source of truth
  isAdmin: boolean;
  followers: string[];
  following: string[];
  avatarUrl?: string;
  avatarHint?: string;
  bio?: string;
  badges?: string[];
  createdAt?: any; // Firestore Timestamp for creation
  // NO PASSWORD HERE
}

// User object used within the application, typically after auth
export interface AuthUser {
  id: string; // Firebase Auth UID
  name: string | null; // Can be null if not set in profile or Firestore
  email: string | null; // Firebase Auth email
  isAdmin: boolean;
  // You can add other frequently accessed, non-sensitive fields from Firestore here
}


// Badge System Types
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
  icon: React.ComponentType<{ className?: string }>; // Lucide icon component
  color?: string;
  criteria: (user: UserFirestoreData, data: BadgeCriteriaData) => boolean; // User type updated
}

// Type for displaying pending comments in admin moderation
export interface PendingCommentDisplay {
  comment: Comment;
  accessoryId: string;
  accessoryName: string;
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

export interface RecentCommentInfo extends Comment {
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

// Site Settings Types
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
