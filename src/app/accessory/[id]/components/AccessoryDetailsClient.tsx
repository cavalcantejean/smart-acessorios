
"use client";

import { useState, useEffect, useRef, startTransition } from 'react';
import type { Accessory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Heart, Loader2, MessageSquareText, ArrowLeft } from 'lucide-react';
import FavoriteButton from '@/components/FavoriteButton';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
// CommentsSection and related imports removed

interface ClientAccessory extends Omit<Accessory, 'createdAt' | 'updatedAt' | 'expiryDate'> {
  createdAt?: string; 
  updatedAt?: string; 
}

interface AccessoryDetailsClientProps {
  accessory: ClientAccessory; 
  isFavoriteInitial: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function AccessoryDetailsClient({ accessory: initialAccessory, isFavoriteInitial, onToggleFavorite }: AccessoryDetailsClientProps) {
  const [accessory, setAccessory] = useState<ClientAccessory>(initialAccessory);
  const [currentSummary, setCurrentSummary] = useState<string | undefined>(initialAccessory.aiSummary || initialAccessory.shortDescription);
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);

  const { toast } = useToast();
  const { user, isAuthenticated, isAdmin, isLoading: isLoadingAuth } = useAuth();

  useEffect(() => {
    setAccessory(initialAccessory);
    setCurrentSummary(initialAccessory.aiSummary || initialAccessory.shortDescription);
    setIsFavorite(isFavoriteInitial);
  }, [initialAccessory, isFavoriteInitial, isAuthenticated, user]);

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

  // Comment related logic removed
  // const [clientComments, setClientComments] = useState<ClientComment[]>(initialAccessory.comments || []);
  // const handleNewComment = (newComment: ClientComment) => {
  //   setClientComments(prevComments => [newComment, ...prevComments]);
  // };


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
      </CardContent>
      <CardFooter className="p-6 bg-secondary/30">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={accessory.affiliateLink} target="_blank" rel="noopener noreferrer">
            Comprar Agora <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>

      {/* CommentsSection removed for static export compatibility */}
      {/* <div className="p-6">
        <CommentsSection
          accessoryId={accessory.id}
          comments={clientComments}
          onCommentAdded={handleNewComment}
          serverAddCommentAction={addCommentAccessoryAction}
        />
      </div> */}
    </Card>
  );
}
