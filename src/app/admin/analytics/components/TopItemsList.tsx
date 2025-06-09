
"use client";

import type { TopAccessoryInfo } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { ThumbsUp, MessageSquare } from 'lucide-react';

interface TopItemsListProps {
  title: string;
  items: TopAccessoryInfo[];
  itemType: 'curtida' | 'comentário';
}

export default function TopItemsList({ title, items, itemType }: TopItemsListProps) {
  const Icon = itemType === 'curtida' ? ThumbsUp : MessageSquare;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Top 5 acessórios por número de {itemType}s.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-4">
            {items.map((item, index) => (
              <li key={item.id} className="flex items-center gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                <span className="text-lg font-semibold text-muted-foreground w-6 text-center">{index + 1}.</span>
                {item.imageUrl && (
                  <div className="relative w-16 h-16 rounded-md overflow-hidden shrink-0">
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="64px"
                      data-ai-hint="product accessory"
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <Link href={`/accessory/${item.id}`} className="font-medium text-primary hover:underline line-clamp-2">
                    {item.name}
                  </Link>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Icon className="h-4 w-4" /> {item.count} {itemType}{item.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-center py-8">Nenhum dado disponível.</p>
        )}
      </CardContent>
    </Card>
  );
}
