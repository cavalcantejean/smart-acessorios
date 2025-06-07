
import { getCoupons } from '@/lib/data';
import type { Coupon } from '@/lib/types';
import CouponCard from '@/components/CouponCard';
import { Ticket } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cupons Promocionais | SmartAcessorios',
  description: 'Encontre os melhores cupons de desconto para acessórios de smartphone.',
};

export default function CouponsPage() {
  const promotionalCoupons: Coupon[] = getCoupons();

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Ticket className="h-8 w-8 text-accent" />
          <h1 className="text-3xl font-bold font-headline">Cupons Promocionais</h1>
        </div>
        {promotionalCoupons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promotionalCoupons.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            Nenhum cupom promocional disponível no momento.
          </p>
        )}
      </section>
    </div>
  );
}
