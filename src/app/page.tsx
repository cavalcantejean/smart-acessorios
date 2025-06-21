import { 
  getAllAccessories, 
  getDailyDeals, 
  getCoupons, 
  getUniqueCategories, 
  getLatestPosts 
} from '@/lib/firebase-data-server'; // ou firebase-data-admin
import { getTestimonials } from '@/lib/site-utils';

// Importe o novo componente de cliente que você criou
import HomePageClient from './HomePageClient';

// A página agora é uma função async
export default async function HomePage() {
  
  // 1. Busque todos os dados no servidor de uma vez
  // O Promise.all é mais rápido pois busca tudo em paralelo
  const [
    accessories,
    deals,
    posts,
    coupons,
    categories,
    testimonials
  ] = await Promise.all([
    getAllAccessories(),
    getDailyDeals(),
    getLatestPosts(3),
    getCoupons(),
    getUniqueCategories(),
    getTestimonials()
  ]);

  // 2. Passe os dados como props para o componente de cliente
  return (
    <HomePageClient 
      initialAccessories={accessories}
      initialDeals={deals}
      initialPosts={posts}
      initialCoupons={coupons}
      initialCategories={categories}
      initialTestimonials={testimonials}
    />
  );
}