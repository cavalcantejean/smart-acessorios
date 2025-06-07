
import { getAllAccessories, getDailyDeals, getCoupons, getTestimonials } from '@/lib/data';
import AccessoryCard from '@/components/AccessoryCard';
import CouponCard from '@/components/CouponCard';
import TestimonialCard from '@/components/TestimonialCard';
import type { Accessory, Coupon, Testimonial } from '@/lib/types';
import { Tag, Ticket, ShoppingBag, ArrowRight, Users, Star } from 'lucide-react'; // Adicionado Star para Destaques
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  const allAccessories: Accessory[] = getAllAccessories();
  const dailyDeals: Accessory[] = getDailyDeals();
  const promotionalCoupons: Coupon[] = getCoupons();
  const testimonials: Testimonial[] = getTestimonials();

  // Usaremos dealsToShow para a GRADE de Ofertas do Dia.
  // O carrossel de destaques usará dailyDeals diretamente ou um slice menor se necessário.
  // Por ora, o carrossel também usará os mesmos 'dealsToShow' para consistência.
  const dealsToShow = dailyDeals.slice(0, 6); 
  const couponsToShow = promotionalCoupons.slice(0, 3);
  const accessoriesToShow = allAccessories.slice(0, 8);
  const testimonialsToShow = testimonials.slice(0, 3);


  return (
    <div className="space-y-12">
      {/* NOVA SEÇÃO: Carrossel de Destaques */}
      {dealsToShow.length > 0 && (
        <section className="relative group"> {/* Added relative group */}
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <Star className="h-7 w-7 text-accent" /> {/* Ícone de Destaque */}
              <h2 className="text-3xl font-bold font-headline">Destaques Imperdíveis</h2>
            </div>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: dealsToShow.length > 1, // Loop se houver mais de 1 item
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {dealsToShow.map((accessory) => (
                <CarouselItem key={`carousel-${accessory.id}`} className="basis-full pl-4"> {/* Mostra 1 item por vez */}
                  <div className="p-1 h-full"> {/* Wrapper para garantir altura */}
                    <AccessoryCard accessory={accessory} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {dealsToShow.length > 1 && ( 
              <>
                <CarouselPrevious
                  variant="ghost"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/60 text-foreground hover:bg-background/90 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center shadow-md"
                />
                <CarouselNext
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/60 text-foreground hover:bg-background/90 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center shadow-md"
                />
              </>
            )}
          </Carousel>
        </section>
      )}

      {dealsToShow.length > 0 && <Separator className="my-8" />} {/* Separador se o carrossel de destaques for mostrado */}

      {/* SEÇÃO ANTIGA: Ofertas do Dia (agora como grade) */}
      <section>
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Tag className="h-7 w-7 text-primary" />
            <h2 className="text-3xl font-bold font-headline">Mais Ofertas do Dia</h2>
          </div>
          {/* Link para ver todas as ofertas se houver mais do que as mostradas na grade */}
          {dailyDeals.length > dealsToShow.length && (
            <Button variant="outline" asChild size="sm">
              <Link href="/deals">
                Ver Todas as Ofertas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        {dealsToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> {/* Layout de grade */}
            {dealsToShow.map((accessory) => (
               <AccessoryCard key={`grid-${accessory.id}`} accessory={accessory} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">Nenhuma oferta do dia disponível no momento. Volte mais tarde!</p>
        )}
      </section>

      <Separator className="my-8" />

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

      {testimonialsToShow.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <Users className="h-7 w-7 text-primary" />
              <h2 className="text-3xl font-bold font-headline">O Que Nossos Clientes Dizem</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonialsToShow.map(testimonial => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-8" />

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
