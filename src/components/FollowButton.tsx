
"use client";

import { useActionState, useEffect, useState, startTransition } from 'react'; // Added startTransition
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import type { toggleFollowAction } from '@/app/profile/actions'; // Type only import
import { useToast } from '@/hooks/use-toast';

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  initialIsFollowing: boolean;
  initialFollowersCount: number;
  formAction: typeof toggleFollowAction; // Pass the server action
  className?: string;
}

interface ActionState {
  success: boolean;
  isFollowing?: boolean;
  followersCount?: number;
  message?: string;
  error?: string;
}

const initialActionState: ActionState = { success: false };

export default function FollowButton({
  currentUserId,
  targetUserId,
  initialIsFollowing,
  initialFollowersCount,
  formAction,
  className,
}: FollowButtonProps) {
  const [state, handleFormAction, isPending] = useActionState(formAction, initialActionState);
  const { toast } = useToast();

  // Local state to manage UI optimistically and based on server response
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);

  useEffect(() => {
    // Sync with initial props
    setIsFollowing(initialIsFollowing);
    setFollowersCount(initialFollowersCount);
  }, [initialIsFollowing, initialFollowersCount]);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        // Update local state based on successful server response
        if (typeof state.isFollowing === 'boolean') setIsFollowing(state.isFollowing);
        if (typeof state.followersCount === 'number') setFollowersCount(state.followersCount);
        toast({ title: state.message });
      } else {
        toast({ title: "Erro", description: state.error || "Ação falhou", variant: "destructive" });
        // Revert optimistic updates if server action failed (if any were made)
        // For this setup, we primarily rely on server state.
      }
    }
  }, [state, toast]);

  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('currentUserId', currentUserId);
    formData.append('targetUserId', targetUserId);
    startTransition(() => {
      handleFormAction(formData);
    });
  };

  return (
    <Button
      onClick={handleSubmit}
      disabled={isPending || currentUserId === targetUserId}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={className}
    >
      {isPending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <UserMinus className="mr-2 h-4 w-4" />
      ) : (
        <UserPlus className="mr-2 h-4 w-4" />
      )}
      {isFollowing ? 'Deixar de Seguir' : 'Seguir'}
      <span className="ml-2 text-xs tabular-nums">({followersCount})</span>
    </Button>
  );
}
