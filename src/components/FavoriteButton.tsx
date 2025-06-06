"use client";

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: () => void;
  className?: string;
}

export default function FavoriteButton({ isFavorite, onClick, className }: FavoriteButtonProps) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.preventDefault(); // Prevent navigation if inside a Link
        onClick();
      }}
      className={cn("rounded-full hover:bg-destructive/10", className)}
      aria-label={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
    >
      <Heart className={cn("h-5 w-5", isFavorite ? "fill-destructive text-destructive" : "text-muted-foreground")} />
    </Button>
  );
}
