
"use client";
import { useFavorites } from '@/hooks/useFavorites';
import type { Accessory, Comment } from '@/lib/types'; // Keep original types for what server provides
import AccessoryDetailsClient from './AccessoryDetailsClient';

// Type for Accessory prop as it comes from the server to this wrapper
// It will have Timestamps as Date objects or ISO strings (depending on Next.js serialization)
interface ServerAccessoryForWrapper extends Omit<Accessory, 'comments' | 'createdAt' | 'updatedAt' | 'expiryDate'> {
  comments: Array<Omit<Comment, 'createdAt'> & { createdAt: string }>; // Server page already converts this
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface AccessoryDetailsClientWrapperProps {
  accessory: ServerAccessoryForWrapper; // Use the defined server-side type
}

export default function AccessoryDetailsClientWrapper({ accessory }: AccessoryDetailsClientWrapperProps) {
  const { isFavorite, toggleFavorite } = useFavorites();

  // The AccessoryDetailsClient expects dates as strings, so we ensure they are.
  // The server page component should already be doing this conversion for comments.
  // Here we just pass through, assuming `accessory.comments[].createdAt` is already string.
  const clientReadyAccessory = {
    ...accessory,
    // comments are already stringified by the page component
  };

  return (
    <AccessoryDetailsClient
      accessory={clientReadyAccessory as any} // Cast as any if types mismatch subtly, client component handles its own state type
      isFavoriteInitial={isFavorite(accessory.id)}
      onToggleFavorite={toggleFavorite}
    />
  );
}
