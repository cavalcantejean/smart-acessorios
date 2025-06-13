
import { getAccessoryById } from '@/lib/data'; // Now async
import type { Accessory, Comment } from '@/lib/types';
import AccessoryDetailsClientWrapper from './components/AccessoryDetailsClientWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const accessory = await getAccessoryById(params.id); // Await async call
  if (!accessory) {
    return {
      title: 'Acessório Não Encontrado',
    };
  }
  return {
    title: `${accessory.name} | SmartAcessorios`,
    description: accessory.shortDescription,
  };
}

// Client-safe Accessory structure for the prop
interface ClientSafeAccessoryForPage extends Omit<Accessory, 'comments' | 'createdAt' | 'updatedAt'> {
  comments: Array<Omit<Comment, 'createdAt'> & { createdAt: string }>;
  createdAt?: string;
  updatedAt?: string;
}


export default async function AccessoryDetailPage({ params }: { params: { id:string } }) {
  const accessory: Accessory | undefined = await getAccessoryById(params.id); // Await async call

  if (!accessory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md p-8 text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-headline">Acessório Não Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Não conseguimos encontrar o acessório que você estava procurando.
            </p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Página Inicial
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Comments need to be prepared for client (convert Timestamps to strings)
  // Also convert accessory's own createdAt and updatedAt
  const preparedAccessory: ClientSafeAccessoryForPage = {
    ...accessory,
    createdAt: accessory.createdAt instanceof Timestamp ? accessory.createdAt.toDate().toISOString() : (accessory.createdAt as any),
    updatedAt: accessory.updatedAt instanceof Timestamp ? accessory.updatedAt.toDate().toISOString() : (accessory.updatedAt as any),
    comments: (accessory.comments || []).map(comment => ({
      ...comment,
      createdAt: comment.createdAt instanceof Timestamp
                 ? comment.createdAt.toDate().toISOString()
                 : (typeof comment.createdAt === 'string' ? comment.createdAt : new Date().toISOString()),
    })),
  };
  
  // Cast to any for the wrapper if its prop type is still the original Accessory
  // Ideally, AccessoryDetailsClientWrapper would also expect ClientSafeAccessoryForPage
  return <AccessoryDetailsClientWrapper accessory={preparedAccessory as any} />;
}
