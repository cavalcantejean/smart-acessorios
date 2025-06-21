
"use server";
import { useFavorites } from '@/hooks/useFavorites';
import type { Accessory } from '@/lib/types';
import AccessoryDetailsClient from './AccessoryDetailsClient';

// Type for Accessory prop as it comes from the server to this wrapper
interface ServerAccessoryForWrapper extends Omit<Accessory, 'createdAt' | 'updatedAt' | 'expiryDate'> {
  // comments removed
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface AccessoryDetailsClientWrapperProps {
  accessory: ServerAccessoryForWrapper; 
}

export default function AccessoryDetailsClientWrapper({ accessory }: AccessoryDetailsClientWrapperProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  const clientReadyAccessory = {
    ...accessory,
  };

  return (
    <AccessoryDetailsClient
      accessory={clientReadyAccessory as any} 
      isFavoriteInitial={isFavorite(accessory.id)}
      onToggleFavorite={toggleFavorite}
    />
  );
}
