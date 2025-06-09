
"use client";

import { ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LikeButtonProps {
  isLiked: boolean;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  likesCount: number;
}

export default function LikeButton({ isLiked, onClick, disabled, className, likesCount }: LikeButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm" // Adjusted size to include text
      onClick={(e) => {
        e.preventDefault();
        if (!disabled) onClick();
      }}
      className={cn(
        "rounded-md hover:bg-primary/10 flex items-center gap-1.5 text-sm",
        isLiked ? "text-primary" : "text-muted-foreground",
        className
      )}
      disabled={disabled}
      aria-label={isLiked ? "Descurtir" : "Curtir"}
    >
      <ThumbsUp className={cn("h-4 w-4", isLiked ? "fill-primary text-primary" : "")} />
      <span>{likesCount}</span>
    </Button>
  );
}
