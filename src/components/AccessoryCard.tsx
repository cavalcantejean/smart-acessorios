
"use client";

import Image from 'next/image';
import Link from 'next/link';
import type { Accessory } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FavoriteButton from './FavoriteButton';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth'; 

interface AccessoryCardProps {
  accessory: Accessory;
  priority?: boolean; // Nova prop para prioridade da imagem
}

export default function AccessoryCard({ accessory, priority = false }: AccessoryCardProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth(); 
  const favoriteStatus = isFavorite(accessory.id);

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl h-full">
      <Link href={`/accessory/${accessory.id}`} className="block">
        <CardHeader className="p-0">
          <div className="aspect-video relative w-full">
            <Image
              src={accessory.imageUrl}
              alt={accessory.name}
              fill={true}
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="rounded-t-lg"
              data-ai-hint={accessory.imageHint || "accessory product"}
              priority={priority} // Aplicar a prop priority
            />
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-4 flex-grow">
        <Link href={`/accessory/${accessory.id}`} className="block">
          <CardTitle className="text-lg font-headline mb-1 hover:text-primary transition-colors">{accessory.name}</CardTitle>
        </Link>
        <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-2">{accessory.shortDescription}</CardDescription>
        {accessory.price && <p className="text-base font-semibold text-primary">R${accessory.price.replace('.', ',')}</p>}
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center border-t">
        <Button asChild variant="outline" size="sm">
          <Link href={`/accessory/${accessory.id}`}>Ver Detalhes</Link>
        </Button>
        {!isLoadingAuth && isAuthenticated && ( 
          <FavoriteButton
            isFavorite={favoriteStatus}
            onClick={() => toggleFavorite(accessory.id)}
          />
        )}
      </CardFooter>
    </Card>
  );
}
