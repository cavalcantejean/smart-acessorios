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
  isDeal?: boolean; // Optional: to mark accessories specifically for deals
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount: string;
  expiryDate?: string;
  store?: string; // Optional: name of the store or brand
}
