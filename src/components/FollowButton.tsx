
"use server";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FollowButtonProps {
  currentUserId: string;
  targetUserId: string;
  initialIsFollowing: boolean;
  initialFollowersCount: number;
  // formAction prop removed
  className?: string;
  isStaticExport?: boolean;
}

export default function FollowButton({
  currentUserId,
  targetUserId,
  initialIsFollowing,
  initialFollowersCount,
  className,
  isStaticExport = true, // Default to true, disabling functionality
}: FollowButtonProps) {
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setIsFollowing(initialIsFollowing);
    setFollowersCount(initialFollowersCount);
  }, [initialIsFollowing, initialFollowersCount]);

  const handleClick = () => {
    if (isStaticExport) {
      toast({
        title: "Funcionalidade Indisponível",
        description: "Seguir usuários não é suportado na exportação estática.",
        variant: "destructive",
      });
      return;
    }

    if (currentUserId === targetUserId) {
      toast({ title: "Ação Inválida", description: "Você não pode seguir a si mesmo.", variant: "destructive" });
      return;
    }

    setIsPending(true);
    // Client-side Firebase logic would go here for dynamic deployment
    console.log(`Attempting to ${isFollowing ? 'unfollow' : 'follow'} user ${targetUserId} (client-side simulation)`);
    
    setTimeout(() => {
      setIsFollowing(!isFollowing);
      setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
      toast({ title: `Sucesso (Simulado)!`, description: isFollowing ? `Deixou de seguir.` : `Agora seguindo!` });
      setIsPending(false);
    }, 1000);
  };

  if (!currentUserId) { // Don't show button if not logged in (currentUserId is a proxy for auth status here)
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isPending || currentUserId === targetUserId || isStaticExport}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className={className}
      title={isStaticExport ? "Seguir usuários desativado em modo estático" : (isFollowing ? "Deixar de seguir" : "Seguir")}
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
