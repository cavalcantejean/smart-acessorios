
import { getAllCouponsAdmin } from '@/lib/data-admin'; // Now async
import type { Coupon } from '@/lib/types';
import CouponCard from '@/components/CouponCard';
import { Ticket } from 'lucide-react';
import type { Metadata } from 'next';
// import { Timestamp } from 'firebase/firestore'; // No longer needed


export const metadata: Metadata = {
  title: 'Cupons Promocionais | SmartAcessorios',
  description: 'Encontre os melhores cupons de desconto para acessórios de smartphone.',
};

// Helper to prepare coupon for client (convert Timestamps to strings)
const prepareCouponForClient = (coupon: Coupon): Coupon => {
  const convertToISO = (dateField: Date | string | undefined): string | undefined => {
    if (!dateField) return undefined;
    if (typeof dateField === 'string') return dateField; // Assume already ISO string
    if (dateField instanceof Date) return dateField.toISOString();
    // Fallback for any other unexpected type
    return String(dateField);
  };
  return {
    ...coupon,
    expiryDate: convertToISO(coupon.expiryDate),
    createdAt: convertToISO(coupon.createdAt),
    updatedAt: convertToISO(coupon.updatedAt),
  };
};

export default async function CouponsPage() {
  const rawCoupons: Coupon[] = await getAllCouponsAdmin(); // Await async call
  const promotionalCoupons = rawCoupons.map(prepareCouponForClient);

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
