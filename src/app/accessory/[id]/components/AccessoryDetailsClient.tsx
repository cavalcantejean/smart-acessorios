"use client";

import { useState, useEffect } from 'react';
import type { Accessory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Heart, Loader2, MessageSquareText, ArrowLeft } from 'lucide-react';
import { summarizeAccessoryDescriptionAction } from '../actions';
import FavoriteButton from '@/components/FavoriteButton';
import { useToast } from "@/hooks/use-toast";

interface AccessoryDetailsClientProps {
  accessory: Accessory;
  isFavoriteInitial: boolean;
  onToggleFavorite: (id: string) => void;
}

export default function AccessoryDetailsClient({ accessory, isFavoriteInitial, onToggleFavorite }: AccessoryDetailsClientProps) {
  const [currentSummary, setCurrentSummary] = useState<string | undefined>(accessory.aiSummary || accessory.shortDescription);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);
  const { toast } = useToast();

  useEffect(() => {
    setIsFavorite(isFavoriteInitial);
  }, [isFavoriteInitial]);

  const handleToggleFavorite = () => {
    onToggleFavorite(accessory.id);
    setIsFavorite(!isFavorite);
    toast({
      title: !isFavorite ? "Added to favorites!" : "Removed from favorites.",
      description: accessory.name,
    });
  };

  const handleGenerateSummary = async () => {
    if (!accessory.fullDescription) {
      toast({
        title: "No full description available",
        description: "Cannot generate summary.",
        variant: "destructive",
      });
      return;
    }
    setIsLoadingSummary(true);
    try {
      const result = await summarizeAccessoryDescriptionAction({ productDescription: accessory.fullDescription });
      setCurrentSummary(result.summary);
      toast({
        title: "Summary Generated!",
        description: "AI-powered summary is now displayed.",
      });
    } catch (error) {
      console.error("Error generating summary:", error);
      setCurrentSummary("Could not generate summary at this time. Please try again.");
      toast({
        title: "Error Generating Summary",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
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
            layout="fill"
            objectFit="cover"
            data-ai-hint={accessory.imageHint || "accessory details"}
          />
        </div>
        <div className="absolute top-4 right-4">
          <FavoriteButton isFavorite={isFavorite} onClick={handleToggleFavorite} className="bg-background/70 hover:bg-background" />
        </div>
         <div className="absolute top-4 left-4">
          <Button variant="outline" size="icon" asChild className="bg-background/70 hover:bg-background">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Back to list</span>
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <CardTitle className="text-3xl font-headline">{accessory.name}</CardTitle>
        
        {accessory.category && (
          <p className="text-sm text-muted-foreground">Category: {accessory.category}</p>
        )}
        {accessory.price && (
          <p className="text-2xl font-semibold text-primary">{accessory.price}</p>
        )}

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Summary</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">{currentSummary}</p>
        </div>
        
        {accessory.fullDescription && accessory.fullDescription !== currentSummary && (
          <Button onClick={handleGenerateSummary} disabled={isLoadingSummary} variant="outline" className="w-full sm:w-auto">
            {isLoadingSummary ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MessageSquareText className="mr-2 h-4 w-4" />
            )}
            {isLoadingSummary ? 'Generating...' : (currentSummary === accessory.aiSummary || currentSummary === accessory.shortDescription ? 'Generate AI Summary' : 'Regenerate AI Summary')}
          </Button>
        )}
        
        {accessory.fullDescription && (
           <details className="mt-4">
            <summary className="cursor-pointer text-sm text-primary hover:underline">View Full Description</summary>
            <p className="text-muted-foreground text-sm mt-2 leading-relaxed whitespace-pre-line">{accessory.fullDescription}</p>
          </details>
        )}
      </CardContent>
      <CardFooter className="p-6 bg-secondary/30">
        <Button asChild className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href={accessory.affiliateLink} target="_blank" rel="noopener noreferrer">
            Buy Now <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
