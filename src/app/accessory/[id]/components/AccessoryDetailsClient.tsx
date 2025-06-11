
"use client";

import { useState, useEffect, useActionState, useRef } from 'react';
import type { Accessory, Comment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Heart, Loader2, MessageSquareText, ArrowLeft, ThumbsUp } from 'lucide-react';
import { summarizeAccessoryDescriptionAction, toggleLikeAccessoryAction, addCommentAccessoryAction } from '../actions';
import FavoriteButton from '@/components/FavoriteButton';
import LikeButton from '@/components/LikeButton';
import CommentsSection from '@/components/CommentsSection';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import { Timestamp } from 'firebase/firestore';


// Type for Accessory props coming into this client component
// Dates from Firestore Timestamps should be strings (ISO) or numbers (milliseconds)
interface ClientAccessory extends Omit<Accessory, 'comments' | 'createdAt' | 'updatedAt' | 'expiryDate'> {
  comments: Array<Omit<Comment, 'createdAt'> & { createdAt: string }>;
  createdAt?: string; // ISO string or undefined
  updatedAt?: string; // ISO string or undefined
  // expiryDate for coupons, if used here, would also be string
}

interface AccessoryDetailsClientProps {
  accessory: ClientAccessory; // Use the client-specific type
  isFavoriteInitial: boolean;
  onToggleFavorite: (id: string) => void;
}

interface LikeActionResult {
  success: boolean;
  isLiked: boolean;
  likesCount: number;
  message?: string;
}
const initialLikeActionState: LikeActionResult = { success: false, isLiked: false, likesCount: 0 };


export default function AccessoryDetailsClient({ accessory: initialAccessory, isFavoriteInitial, onToggleFavorite }: AccessoryDetailsClientProps) {
  const [accessory, setAccessory] = useState<ClientAccessory>(initialAccessory);
  const [currentSummary, setCurrentSummary] = useState<string | undefined>(initialAccessory.aiSummary || initialAccessory.shortDescription);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);

  const { toast } = useToast();
  const { user, isAuthenticated, isAdmin, isLoading: isLoadingAuth } = useAuth();

  const [likeState, handleLikeAction, isLikePending] = useActionState(toggleLikeAccessoryAction, initialLikeActionState);
  const [isLikedByCurrentUser, setIsLikedByCurrentUser] = useState(false);
  const [currentLikesCount, setCurrentLikesCount] = useState(0);

  const [currentComments, setCurrentComments] = useState<(Omit<Comment, 'createdAt'> & { createdAt: string })[]>([]);

  useEffect(() => {
    setAccessory(initialAccessory);
    setCurrentSummary(initialAccessory.aiSummary || initialAccessory.shortDescription);
    setIsFavorite(isFavoriteInitial);
    setCurrentLikesCount(initialAccessory.likedBy?.length || 0);
    setIsLikedByCurrentUser(isAuthenticated && user ? initialAccessory.likedBy?.includes(user.id) : false);
    // Filter and set comments
    setCurrentComments(initialAccessory.comments?.filter(c => c.status === 'approved') || []);
  }, [initialAccessory, isFavoriteInitial, isAuthenticated, user]);


  useEffect(() => {
    if (likeState?.message) {
      if (likeState.success) {
        setIsLikedByCurrentUser(likeState.isLiked);
        setCurrentLikesCount(likeState.likesCount);
        toast({ title: "Sucesso!", description: likeState.message });
      } else {
        toast({ title: "Erro", description: likeState.message || "Falha ao processar curtida.", variant: "destructive" });
      }
    }
  }, [likeState, toast]);


  const handleToggleFavoriteClient = () => {
    if (!isAuthenticated) {
      toast({
        title: "Login Necessário",
        description: "Você precisa estar logado para favoritar acessórios.",
        variant: "destructive",
      });
      return;
    }
    onToggleFavorite(accessory.id);
    setIsFavorite(!isFavorite);
    toast({
      title: !isFavorite ? "Adicionado aos favoritos!" : "Removido dos favoritos.",
      description: accessory.name,
    });
  };

  const handleInternalLikeAction = () => {
    if (!isAuthenticated || !user) {
      toast({ title: "Login Necessário", description: "Você precisa estar logado para curtir.", variant: "destructive" });
      return;
    }
    const formData = new FormData();
    formData.append('accessoryId', accessory.id);
    formData.append('userId', user.id);
    handleLikeAction(formData);
  };

  // Type for comment when it's added, createdAt will be string
  const handleCommentAdded = (newComment: Omit<Comment, 'createdAt'> & { createdAt: string }) => {
    if (newComment.status === 'approved') {
      setCurrentComments(prevComments => [...prevComments, newComment]);
    }
  };


  const handleGenerateSummary = async () => {
    if (!accessory.fullDescription) {
      toast({
        title: "Descrição completa não disponível",
        description: "Não é possível gerar o resumo.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingSummary(true);
    try {
      const result = await summarizeAccessoryDescriptionAction({ productDescription: accessory.fullDescription });
      setCurrentSummary(result.summary);
      toast({
        title: "Resumo Gerado!",
        description: "O resumo gerado por IA agora está visível.",
      });
    } catch (error) {
      console.error("Erro ao gerar resumo:", error);
      setCurrentSummary("Não foi possível gerar o resumo no momento. Por favor, tente novamente.");
      toast({
        title: "Erro ao Gerar Resumo",
        description: error instanceof Error ? error.message : "Ocorreu um erro desconhecido.",
        variant: "destructive",
      });
    }
    setIsLoadingSummary(false);
  };

  return (
    <Card className="overflow-hidden shadow-xl">
      <CardHeader className="p-0 relative">
        <div className="aspect-video w-full relative">
          <Image
            src={accessory.imageUrl}
            alt={accessory.name}
            fill={true}
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            data-ai-hint={accessory.imageHint || "accessory details"}
            priority={true}
          />
        </div>
        {!isLoadingAuth && isAuthenticated && (
          <div className="absolute top-4 right-4 flex gap-2">
            <FavoriteButton isFavorite={isFavorite} onClick={handleToggleFavoriteClient} className="bg-background/70 hover:bg-background" />
          </div>
        )}
         <div className="absolute top-4 left-4">
          <Button variant="outline" size="icon" asChild className="bg-background/70 hover:bg-background">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Voltar à lista</span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="flex justify-between items-start">
            <CardTitle className="text-3xl font-headline">{accessory.name}</CardTitle>
            {!isLoadingAuth && isAuthenticated && (
                 <LikeButton
                    isLiked={isLikedByCurrentUser}
                    onClick={handleInternalLikeAction}
                    disabled={isLikePending}
                    likesCount={currentLikesCount}
                    className="mt-1"
                />
            )}
        </div>

        {accessory.category && (
          <p className="text-sm text-muted-foreground">Categoria: {accessory.category}</p>
        )}
        {accessory.price && (
          <p className="text-2xl font-semibold text-primary">R${accessory.price.replace('.', ',')}</p>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Resumo</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{currentSummary}</p>
        </div>

        {!isLoadingAuth && isAuthenticated && isAdmin && accessory.fullDescription && accessory.fullDescription !== currentSummary && (
          <Button onClick={handleGenerateSummary} disabled={isLoadingSummary} variant="outline" className="w-full sm:w-auto">
            {isLoadingSummary ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MessageSquareText className="mr-2 h-4 w-4" />
            )}
            {isLoadingSummary ? 'Gerando...' : (currentSummary === accessory.aiSummary || currentSummary === accessory.shortDescription ? 'Gerar Resumo com IA' : 'Gerar Novo Resumo com IA')}
          </Button>
        )}

        {accessory.fullDescription && (
           <details className="mt-4">
            <summary className="cursor-pointer text-sm text-primary hover:underline">Ver Descrição Completa</summary>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed whitespace-pre-line">{accessory.fullDescription}</p>
          </details>
        )}

        {accessory.embedHtml && (
          <div className="my-6 rounded-lg overflow-hidden shadow-md aspect-video">
            <div className="[&_iframe]:w-full [&_iframe]:h-full [&_iframe]:rounded-lg" dangerouslySetInnerHTML={{ __html: accessory.embedHtml }} />
          </div>
        )}

        <CommentsSection
          accessoryId={accessory.id}
          comments={currentComments}
          onCommentAdded={handleCommentAdded}
          serverAddCommentAction={addCommentAccessoryAction}
        />
      </CardContent>
      <CardFooter className="p-6 bg-secondary/30">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={accessory.affiliateLink} target="_blank" rel="noopener noreferrer">
            Comprar Agora <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
