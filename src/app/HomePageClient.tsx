
"use client";
import React, { useState, useEffect } from 'react';
import { getAllAccessories, getDailyDeals, getCoupons, getUniqueCategories, getLatestPosts } from '@/lib/firebase-data-client';
import { getTestimonials } from '@/lib/site-utils';
import AccessoryCard from '@/components/AccessoryCard';
import CouponCard from '@/components/CouponCard';
import TestimonialCard from '@/components/TestimonialCard';
import BlogPostCard from '@/components/BlogPostCard';
import type { Accessory, Coupon, Testimonial, Post } from '@/lib/types';
import { Tag, Ticket, ShoppingBag, ArrowRight, Users, Star, BookOpenText, Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Image from 'next/image'; 
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Timestamp } from 'firebase/firestore';

interface HomePageClientProps {
  initialAccessories: Accessory[];
  initialDeals: Accessory[];
  initialPosts: Post[];
  initialCoupons: Coupon[];
  initialCategories: string[];
  initialTestimonials: Testimonial[];
}

// Helper to prepare accessory for client (convert Timestamps)
const prepareAccessoryForClient = (accessory: Accessory): Accessory => {
  return {
    ...accessory,
    createdAt: accessory.createdAt instanceof Timestamp ? accessory.createdAt.toDate().toISOString() : accessory.createdAt as any,
    updatedAt: accessory.updatedAt instanceof Timestamp ? accessory.updatedAt.toDate().toISOString() : accessory.updatedAt as any,
    // comments mapping removed
  };
};

const prepareCouponForClient = (coupon: Coupon): Coupon => {
  return {
    ...coupon,
    expiryDate: coupon.expiryDate instanceof Timestamp ? coupon.expiryDate.toDate().toISOString() : coupon.expiryDate as any,
    createdAt: coupon.createdAt instanceof Timestamp ? coupon.createdAt.toDate().toISOString() : coupon.createdAt as any,
    updatedAt: coupon.updatedAt instanceof Timestamp ? coupon.updatedAt.toDate().toISOString() : coupon.updatedAt as any,
  };
};

const preparePostForClient = (post: Post): Post => {
  return {
    ...post,
    publishedAt: post.publishedAt instanceof Timestamp ? post.publishedAt.toDate().toISOString() : post.publishedAt as any,
    createdAt: post.createdAt instanceof Timestamp ? post.createdAt.toDate().toISOString() : post.createdAt as any,
    updatedAt: post.updatedAt instanceof Timestamp ? post.updatedAt.toDate().toISOString() : post.updatedAt as any,
  };
};


export default function HomePageClient({
  initialAccessories,
  initialDeals,
  initialPosts,
  initialCoupons,
  initialCategories,
  initialTestimonials
}: HomePageClientProps) {
  const [baseAccessoriesData, setBaseAccessoriesData] = useState<Accessory[]>(initialAccessories);
  const [baseDailyDealsData, setBaseDailyDealsData] = useState<Accessory[]>(initialDeals);
  const [basePromotionalCouponsData, setBasePromotionalCouponsData] = useState<Coupon[]>(initialCoupons);
  const [baseTestimonialsData, setBaseTestimonialsData] = useState<Testimonial[]>(initialTestimonials); 
  const [baseLatestPostsData, setBaseLatestPostsData] = useState<Post[]>(initialPosts);
  const [categories, setCategories] = useState<string[]>(initialCategories);

  const [searchTermAccessories, setSearchTermAccessories] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayedAccessories, setDisplayedAccessories] = useState<Accessory[]>([]);
  const [couponSearchTerm, setCouponSearchTerm] = useState('');
  const [displayedCoupons, setDisplayedCoupons] = useState<Coupon[]>([]);

  const autoplayPlugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true, stopOnFocusIn: true })
  );

  const dealsToShowInCarousel = baseDailyDealsData.slice(0, 6);
  const dealsToShowInGrid = baseDailyDealsData.slice(0, 4);
  const testimonialsToShow = baseTestimonialsData.slice(0, 3); 

  return (
    <div className="space-y-12">
      {dealsToShowInCarousel.length > 0 && (
        <section className="relative group">
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <Star className="h-7 w-7 text-accent" />
              <h2 className="text-3xl font-bold font-headline">Destaques Imperdíveis</h2>
            </div>
          </div>
          <Carousel
            opts={{ align: "start", loop: dealsToShowInCarousel.length > 1, }}
            plugins={[autoplayPlugin.current]}
            onMouseEnter={autoplayPlugin.current.stop}
            // onMouseLeave={autoplayPlugin.current.play}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {dealsToShowInCarousel.map((accessory, index) => (
                <CarouselItem key={`carousel-${accessory.id}`} className="basis-full pl-4">
                  <div className="p-1 h-full">
                     <AccessoryCard accessory={accessory} priority={index === 0} />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {dealsToShowInCarousel.length > 1 && (
              <>
                <CarouselPrevious variant="ghost" className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/60 text-foreground hover:bg-background/90 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center shadow-md" />
                <CarouselNext variant="ghost" className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/60 text-foreground hover:bg-background/90 hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden sm:flex items-center justify-center shadow-md" />
              </>
            )}
          </Carousel>
        </section>
      )}

      {dealsToShowInCarousel.length > 0 && <Separator className="my-8" />}

      <section>
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex items-center gap-2">
            <Tag className="h-7 w-7 text-primary" />
            <h2 className="text-3xl font-bold font-headline">Mais Ofertas do Dia</h2>
          </div>
          {baseDailyDealsData.length > dealsToShowInGrid.length && (
            <Button variant="outline" asChild size="sm">
              <Link href="/deals">
                Ver Todas as Ofertas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
        {dealsToShowInGrid.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dealsToShowInGrid.map((accessory) => (
               <AccessoryCard key={`grid-${accessory.id}`} accessory={accessory} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">Nenhuma oferta do dia disponível no momento. Volte mais tarde!</p>
        )}
      </section>

      <Separator className="my-8" />

      {baseLatestPostsData.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-2 mb-6">
            <div className="flex items-center gap-2">
              <BookOpenText className="h-7 w-7 text-primary" />
              <h2 className="text-3xl font-bold font-headline">Últimos Artigos do Blog</h2>
            </div>
            <Button variant="outline" asChild size="sm">
              <Link href="/blog">
                Ver Todos os Artigos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {baseLatestPostsData.map(post => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        </section>
      )}

      <Separator className="my-8" />

      {basePromotionalCouponsData.length > 0 && (
        <section>
          <div className="flex items-center justify-between gap-2 mb-6">
             <div className="flex items-center gap-2">
                <Ticket className="h-7 w-7 text-accent" />
                <h2 className="text-3xl font-bold font-headline">Cupons Promocionais</h2>
              </div>
            {basePromotionalCouponsData.length > displayedCoupons.length && basePromotionalCouponsData.length > 3 && (
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
              value={couponSearchTerm}
              onChange={(e) => setCouponSearchTerm(e.target.value)}
            />
          </div>
          {displayedCoupons.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCoupons.map(coupon => (
                <CouponCard key={coupon.id} coupon={coupon} />
              ))}
            </div>
          ) : (
             <p className="text-center text-muted-foreground py-10">
              {couponSearchTerm
                ? "Nenhum cupom encontrado com os filtros atuais."
                : "Nenhum cupom promocional disponível no momento."}
            </p>
          )}
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
            {baseAccessoriesData.length > displayedAccessories.length && (
              <Button variant="outline" asChild size="sm">
                <Link href="/products">
                  Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Input
              type="search"
              placeholder="Buscar por nome ou categoria..."
              className="w-full sm:flex-grow"
              value={searchTermAccessories}
              onChange={(e) => setSearchTermAccessories(e.target.value)}
            />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-auto sm:min-w-[200px]">
                <SelectValue placeholder="Filtrar por categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        {displayedAccessories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedAccessories.map(acc => (
              <AccessoryCard key={acc.id} accessory={acc} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">Nenhum acessório encontrado com os filtros atuais.</p>
        )}
      </section>
    </div>
  );
}
