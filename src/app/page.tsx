
import { getAllAccessories, getDailyDeals, getCoupons } from '@/lib/data';
import AccessoryCard from '@/components/AccessoryCard';
import CouponCard from '@/components/CouponCard';
import type { Accessory, Coupon } from '@/lib/types';
import { Tag, Ticket, ShoppingBag } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export default function HomePage() {
  const allAccessories: Accessory[] = getAllAccessories();
  const dailyDeals: Accessory[] = getDailyDeals();
  const promotionalCoupons: Coupon[] = getCoupons();

  return (
    <div className="space-y-12">
      {/* Daily Deals Section */}
      {dailyDeals.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-7 w-7 text-primary" />
            <h2 className="text-3xl font-bold font-headline">Ofertas do Dia</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dailyDeals.map(acc => (
              <AccessoryCard key={acc.id} accessory={acc} />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-8" />

      {/* Promotional Coupons Section */}
      {promotionalCoupons.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Ticket className="h-7 w-7 text-accent" />
            <h2 className="text-3xl font-bold font-headline">Cupons Promocionais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotionalCoupons.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </section>
      )}
      
      <Separator className="my-8" />

      {/* All Accessories Section */}
      <section>
         <div className="flex items-center gap-2 mb-6">
            <ShoppingBag className="h-7 w-7 text-primary" />
            <h2 className="text-3xl font-bold font-headline">Todos os Acessórios</h2>
          </div>
        {allAccessories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allAccessories.map(acc => (
              <AccessoryCard key={acc.id} accessory={acc} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Nenhum acessório encontrado.</p>
        )}
      </section>
    </div>
  );
}
