
"use client";

import type { Post } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, UserCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

interface BlogPostCardProps {
  post: Post;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);

  // useEffect(() => {
  //   // setFormattedDate(new Date(post.publishedAt).toLocaleDateString('pt-BR', {
  //     year: 'numeric',
  //     month: 'long',
  //     day: 'numeric',
  //     timeZone: 'UTC' 
  //   }));
  // }, [post.publishedAt]);

  return (
    <Card className="flex flex-col overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl h-full">
      <Link href={`/blog/${post.slug}`} className="block group">
        <CardHeader className="p-0">
          <div className="aspect-video relative w-full overflow-hidden rounded-t-lg">
            <Image
              src={post.imageUrl}
              alt={post.title}
              fill={true}
              style={{ objectFit: 'cover' }}
              className="transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={post.imageHint || "blog post"}
            />
          </div>
        </CardHeader>
      </Link>
      <CardContent className="p-6 flex-grow">
        {post.category && (
          <Badge variant="secondary" className="mb-2 text-xs">{post.category}</Badge>
        )}
        <Link href={`/blog/${post.slug}`} className="block">
          <CardTitle className="text-xl font-headline mb-2 hover:text-primary transition-colors line-clamp-2">{post.title}</CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="p-6 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {post.authorAvatarUrl ? (
              <AvatarImage src={post.authorAvatarUrl} alt={post.authorName} data-ai-hint={post.authorAvatarHint || "author avatar"} />
            ) : null}
            <AvatarFallback>
              <UserCircle className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <span>{post.authorName}</span>
        </div>
        {/* <div className="flex items-center gap-1">
          <CalendarDays className="h-4 w-4" />
          <time dateTime={post.publishedAt}>{formattedDate || 'Carregando data...'}</time>
        </div> */}
      </CardFooter>
    </Card>
  );
}
