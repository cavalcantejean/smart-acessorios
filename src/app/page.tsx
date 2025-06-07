
import { getAllAccessories, getDailyDeals, getCoupons, getTestimonials } from '@/lib/data';
import AccessoryCard from '@/components/AccessoryCard';
import CouponCard from '@/components/CouponCard';
import TestimonialCard from '@/components/TestimonialCard';
import type { Accessory, Coupon, Testimonial } from '@/lib/types';
import { Tag, Ticket, ShoppingBag, ArrowRight, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  const allAccessories: Accessory[] = getAllAccessories();
  const dailyDeals: Accessory[] = getDailyDeals();
  const promotionalCoupons: Coupon[] = getCoupons();
  const testimonials: Testimonial[] = getTestimonials();

  // Limitar o número de itens exibidos na homepage
  const dealsToShow = dailyDeals.slice(0, 4); // Mostrar até 4 ofertas
  const couponsToShow = promotionalCoupons.slice(0, 3); // Mostrar até 3 cupons
  const accessoriesToShow = allAccessories.slice(0, 8); // Mostrar até 8 produtos gerais
  const testimonialsToShow = testimonials.slice(0, 3); // Mostrar até 3 testemunhos


  return (
    <div className="space-y-12">
      {/* Daily Deals Section */}
      {dealsToShow.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <Tag className="h-7 w-7 text-primary" />
              <h2 className="text-3xl font-bold font-headline">Ofertas do Dia</h2>
            </div>
            {dailyDeals.length > dealsToShow.length && (
              <Button variant="outline" asChild size="sm">
                <Link href="/deals">
                  Ver Todas <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dealsToShow.map(acc => (
              <AccessoryCard key={acc.id} accessory={acc} />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-8" />

      {/* Promotional Coupons Section */}
      {couponsToShow.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-2 mb-6">
             <div className="flex items-center gap-2">
                <Ticket className="h-7 w-7 text-accent" />
                <h2 className="text-3xl font-bold font-headline">Cupons Promocionais</h2>
              </div>
            {promotionalCoupons.length > couponsToShow.length && (
               <Button variant="outline" asChild size="sm">
                <Link href="/coupons">
                  Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {couponsToShow.map(coupon => (
              <CouponCard key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </section>
      )}
      
      <Separator className="my-8" />

      {/* Testimonials Section */}
      {testimonialsToShow.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" />
              <h2 className="text-3xl font-bold font-headline">O Que Nossos Clientes Dizem</h2>
            </div>
            {/* Poderia haver um link para uma página de todos os testemunhos aqui, se aplicável */}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonialsToShow.map(testimonial => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-8" />

      {/* All Accessories Section */}
      <section>
         <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-7 w-7 text-primary" />
              <h2 className="text-3xl font-bold font-headline">Mais Acessórios</h2>
            </div>
            {allAccessories.length > accessoriesToShow.length && (
              <Button variant="outline" asChild size="sm">
                <Link href="/products">
                  Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        {accessoriesToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {accessoriesToShow.map(acc => (
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
