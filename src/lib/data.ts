import type { Accessory, Coupon, Testimonial } from './types';

const accessories: Accessory[] = [
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
    aiSummary: 'Bluetooth headphones with active noise cancellation, 30-hour playtime, and comfortable memory foam earcups for immersive audio.'
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
    aiSummary: 'A slim, durable silicone case offering drop/scratch protection, comfortable grip, and easy port access.'
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
    aiSummary: 'A compact 10000mAh power bank with dual USB ports and LED indicator for on-the-go charging.'
  },
];

const coupons: Coupon[] = [
  {
    id: 'coupon1',
    code: 'SUMMER20',
    description: 'Get 20% off on all summer accessories.',
    discount: '20% OFF',
    expiryDate: '2024-08-31',
    store: 'AccessoryStore'
  },
  {
    id: 'coupon2',
    code: 'AUDIOFUN',
    description: '15% discount on headphones and speakers.',
    discount: '15% OFF',
    expiryDate: '2024-09-15',
    store: 'SoundGoodies'
  },
  {
    id: 'coupon3',
    code: 'FREESHIP',
    description: 'Free shipping on orders over R$50.', 
    discount: 'Free Shipping',
    store: 'GadgetHub'
  },
];

const testimonials: Testimonial[] = [
  {
    id: 'testimonial1',
    name: 'Ana Silva',
    quote: 'Encontrei os melhores acessórios aqui! A seleção de ofertas do dia é incrível e os resumos de IA me ajudam a decidir rapidamente. Recomendo!',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarHint: 'woman smiling',
    role: 'Cliente Satisfeita'
  },
  {
    id: 'testimonial2',
    name: 'Carlos Pereira',
    quote: 'Os cupons promocionais são ótimos! Consegui um bom desconto na minha última compra de fones de ouvido. O site é fácil de navegar.',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarHint: 'man glasses',
    role: 'Entusiasta de Gadgets'
  },
  {
    id: 'testimonial3',
    name: 'Juliana Costa',
    quote: 'Adoro a variedade de produtos e a clareza das descrições. A funcionalidade de favoritar é muito útil para salvar itens que quero comprar depois.',
    avatarUrl: 'https://placehold.co/100x100.png',
    avatarHint: 'person nature',
    role: 'Compradora Online'
  }
];

export function getAllAccessories(): Accessory[] {
  return accessories;
}

export function getAccessoryById(id: string): Accessory | undefined {
  return accessories.find(acc => acc.id === id);
}

export function getUniqueCategories(): string[] {
  const categories = new Set<string>();
  accessories.forEach(acc => {
    if (acc.category) {
      categories.add(acc.category);
    }
  });
  return Array.from(categories).sort();
}

export function getDailyDeals(): Accessory[] {
  // For now, return accessories marked as deals, or first 2 items if none are marked.
  const deals = accessories.filter(acc => acc.isDeal);
  return deals.length > 0 ? deals : accessories.slice(0, 2);
}

export function getCoupons(): Coupon[] {
  return coupons;
}

export function getTestimonials(): Testimonial[] {
  return testimonials;
}
