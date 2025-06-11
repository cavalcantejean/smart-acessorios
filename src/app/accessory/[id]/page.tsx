
import { getAccessoryById } from '@/lib/data'; // Now async
import type { Accessory } from '@/lib/types';
import AccessoryDetailsClientWrapper from './components/AccessoryDetailsClientWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

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
  const preparedAccessory = {
    ...accessory,
    comments: (accessory.comments || []).map(comment => ({
      ...comment,
      createdAt: comment.createdAt instanceof Object && 'toDate' in comment.createdAt 
                 ? (comment.createdAt as import('firebase/firestore').Timestamp).toDate().toISOString() 
                 : (typeof comment.createdAt === 'string' ? comment.createdAt : new Date().toISOString()),
    })),
  };

  return <AccessoryDetailsClientWrapper accessory={preparedAccessory as Accessory & { comments: Array<Comment & { createdAt: string }>}} />;
}
