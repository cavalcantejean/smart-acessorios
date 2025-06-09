
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string; // ISO date string
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
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: string;
  expiryDate?: string;
  store?: string; // Optional: name of the store or brand
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
}

export interface AuthUser extends Omit<User, 'password'> {}

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
  tags?: string[];
  publishedAt: string; // ISO date string e.g., "2024-07-28T10:00:00Z"
}
