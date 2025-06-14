
"use client";

import type { Post } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, UserCircle, BookOpenText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';

// Client-side post type where dates are strings
interface ClientPost extends Omit<Post, 'publishedAt' | 'createdAt' | 'updatedAt'> {
  publishedAt: string; // ISO string
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
}

interface BlogPostClientViewProps {
  post: ClientPost | null;
}

export default function BlogPostClientView({ post }: BlogPostClientViewProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Initial loading state

  useEffect(() => {
    if (post) {
      setFormattedDate(new Date(post.publishedAt).toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC' // Ensure consistent date formatting regardless of client timezone
      }));
      setIsLoading(false); // Data is available, set loading to false
    } else {
      setIsLoading(false); // Post is null (not found), set loading to false
    }
  }, [post]);


  if (isLoading) { // This state is now primarily for initial render before post prop is processed
    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div role="status" className="flex flex-col items-center">
                <svg aria-hidden="true" className="w-10 h-10 text-muted-foreground animate-spin fill-primary" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0492C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
                <span className="sr-only">Carregando artigo...</span>
                <p className="mt-4 text-muted-foreground">Carregando artigo...</p>
            </div>
        </div>
    );
  }

  if (!post) { // Parent component should handle this, but as a fallback
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <BookOpenText className="h-20 w-20 text-muted-foreground mb-6" />
        <h1 className="text-3xl font-bold mb-4">Artigo Não Encontrado</h1>
        <p className="text-muted-foreground mb-8">
          O artigo que você está procurando não existe ou foi movido.
        </p>
        <Button asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para o Blog
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <Button variant="outline" size="sm" asChild className="mb-8 group">
        <Link href="/blog">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Voltar para o Blog
        </Link>
      </Button>

      <article className="space-y-8">
        <header className="space-y-4">
          {post.category && (
            <Badge variant="default" className="text-sm">{post.category}</Badge>
          )}
          <h1 className="text-4xl lg:text-5xl font-bold font-headline !leading-tight tracking-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                 {post.authorAvatarUrl ? (
                    <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} data-ai-hint={post.authorAvatarHint || "author avatar"} />
                  ) : null}
                <AvatarFallback>
                  <UserCircle className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
              <span>{post.authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="h-4 w-4" />
              <time dateTime={post.publishedAt}>{formattedDate || 'Carregando data...'}</time>
            </div>
          </div>
        </header>

        {post.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill={true}
              style={{ objectFit: 'cover' }}
              priority={true}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 1000px"
              data-ai-hint={post.imageHint || "blog hero"}
            />
          </div>
        )}

        {post.embedHtml && (
          <div className="my-8">
            <Separator />
            <div
              className="aspect-video mt-8 w-full max-w-full overflow-hidden rounded-lg shadow-lg [&_iframe]:w-full [&_iframe]:h-full [&_iframe]:rounded-lg"
              dangerouslySetInnerHTML={{ __html: post.embedHtml }}
            />
            <Separator className="mt-8"/>
          </div>
        )}

        <Card>
          <CardContent className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none pt-6 text-foreground/90">
            <div dangerouslySetInnerHTML={{ __html: post.content }} />
          </CardContent>
        </Card>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <span className="font-semibold text-sm">Tags:</span>
            {post.tags.map(tag => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

