
"use client";
import React from 'react'; // Import React
import { getAllAccessories, getDailyDeals, getCoupons, getTestimonials } from '@/lib/data';
import AccessoryCard from '@/components/AccessoryCard';
import CouponCard from '@/components/CouponCard';
import TestimonialCard from '@/components/TestimonialCard';
import type { Accessory, Coupon, Testimonial } from '@/lib/types';
import { Tag, Ticket, ShoppingBag, ArrowRight, Users, Star } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"; // Importar Input
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Autoplay from "embla-carousel-autoplay";


export default function HomePage() {
  const allAccessories: Accessory[] = getAllAccessories();
  const dailyDeals: Accessory[] = getDailyDeals();
  const promotionalCoupons: Coupon[] = getCoupons();
  const testimonials: Testimonial[] = getTestimonials();

  const dealsToShow = dailyDeals.slice(0, 6); 
  const couponsToShow = promotionalCoupons.slice(0, 3);
  const accessoriesToShow = allAccessories.slice(0, 8);
  const testimonialsToShow = testimonials.slice(0, 3);

  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true, stopOnFocusIn: true })
  );


  return (
    <div className="space-y-12">
      {dealsToShow.length > 0 && (
        <section className="relative group">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <Star className="h-7 w-7 text-accent" />
              <h2 className="text-3xl font-bold font-headline">Destaques Imperdíveis</h2>
            </div>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: dealsToShow.length > 1,
            }}
            plugins={[autoplayPlugin.current]}
            onMouseEnter={autoplayPlugin.current.stop}
            onMouseLeave={autoplayPlugin.current.play}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {dealsToShow.map((accessory) => (
                <CarouselItem key={`carousel-${accessory.id}`} className="basis-full pl-4">
                  <div className="p-1 h-full">
                     <AccessoryCard accessory={accessory} priority={true} />
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

      {dealsToShow.length > 0 && <Separator className="my-8" />}

      <section>
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Tag className="h-7 w-7 text-primary" />
            <h2 className="text-3xl font-bold font-headline">Mais Ofertas do Dia</h2>
          </div>
          {dailyDeals.length > dealsToShow.length && (
            <Button variant="outline" asChild size="sm">
              <Link href="/deals">
                Ver Todas as Ofertas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        {dealsToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Buscar cupom por nome ou loja..."
              className="w-full md:w-1/2 lg:w-1/3"
            />
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
          <div className="mb-6">
            <Input
              type="search"
              placeholder="Buscar acessório por nome ou categoria..."
              className="w-full md:w-1/2 lg:w-1/3"
            />
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
