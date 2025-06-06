"use client";
import { useFavorites } from '@/hooks/useFavorites';
import type { Accessory } from '@/lib/types';
import AccessoryDetailsClient from './AccessoryDetailsClient'; 

interface AccessoryDetailsClientWrapperProps {
  accessory: Accessory;
}

export default function AccessoryDetailsClientWrapper({ accessory }: AccessoryDetailsClientWrapperProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  
  return (
    <AccessoryDetailsClient 
      accessory={accessory} 
      isFavoriteInitial={isFavorite(accessory.id)} 
      onToggleFavorite={toggleFavorite} 
    />
  );
}
