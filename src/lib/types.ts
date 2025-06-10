
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

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, this would be a hashed password
  isAdmin: boolean;
  following: string[]; // IDs of users this user follows
  followers: string[]; // IDs of users who follow this user
  avatarUrl?: string; // Optional avatar URL
  avatarHint?: string;
  bio?: string; // Optional user bio
  badges?: string[]; // Array of badge IDs
}

export interface AuthUser extends Omit<User, 'password'> {}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // For now, simple text or basic HTML. Later, could be Markdown or structured content.
  imageUrl: string;
  imageHint?: string;
  authorName: string;
  authorAvatarUrl?: string;
  authorAvatarHint?: string;
  category?: string;
  tags?: string[]; // Array of tags
  publishedAt: string; // ISO date string e.g., "2024-07-28T10:00:00Z"
  embedHtml?: string; 
}

// Badge System Types
export interface BadgeCriteriaData {
  userCommentsCount: number;
  userLikesCount: number;
  userFollowingCount: number;
  userFollowersCount: number;
  // Add more counts as needed, e.g., favoritesCount
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>; // Lucide icon component
  color?: string; // Optional: Tailwind color class for the badge, e.g., "bg-blue-500 text-white"
  criteria: (user: User, data: BadgeCriteriaData) => boolean;
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
  count: number; // Could be likes or comments count
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
  platform: string; // e.g., 'Facebook', 'Instagram' - used as key/id
  label: string; // User-friendly label, e.g., "Facebook"
  url: string;
  IconComponent: ComponentType<{ className?: string }>; // Lucide icon component for fallback
  placeholderUrl: string; // Placeholder for the input field
  customImageUrl?: string; // URL for custom uploaded image (e.g., data URI)
}

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  socialLinks: SocialLinkSetting[];
  siteLogoUrl?: string;
  siteFaviconUrl?: string;
}

// Error Reporting Types
export type ErrorReportStatus = 'new' | 'seen' | 'resolved' | 'ignored';

export interface ErrorReport {
  id: string;
  timestamp: string; // ISO date string
  message: string;
  source?: string; // URL or component name where error occurred
  stackTrace?: string;
  userId?: string;
  userName?: string;
  userAgent?: string; // Browser/OS info
  status: ErrorReportStatus;
  details?: Record<string, any>; // Any other relevant details
}
