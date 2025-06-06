"use client";

import { useEffect, useState } from 'react';
import { getAllAccessories } from '@/lib/data';
import type { Accessory } from '@/lib/types';
import AccessoryCard from '@/components/AccessoryCard';
import { useFavorites } from '@/hooks/useFavorites';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const [allAccessories, setAllAccessories] = useState<Accessory[]>([]);
  
  useEffect(() => {
    setAllAccessories(getAllAccessories());
  }, []);

  const favoritedAccessories = allAccessories.filter(acc => favoriteIds.includes(acc.id));

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Heart className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl font-bold text-center font-headline">Your Favorites</h1>
        </div>
        {favoritedAccessories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoritedAccessories.map(acc => (
              <AccessoryCard key={acc.id} accessory={acc} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            You haven&apos;t favorited any accessories yet. Browse accessories and click the heart icon to save them here!
          </p>
        )}
      </section>
    </div>
  );
}
