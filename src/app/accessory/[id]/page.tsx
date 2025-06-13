
import { getAccessoryById } from '@/lib/data'; // Now async
import type { Accessory, Comment } from '@/lib/types'; // Use Comment from types
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import AccessoryDetailsClientWrapper from './components/AccessoryDetailsClientWrapper';
import { Timestamp } from 'firebase/firestore';
import type { Metadata } from 'next';

// Helper to prepare accessory data for client components
// Converts Timestamps to ISO strings
const prepareAccessoryForClient = (accessory: Accessory): any => {
  return {
    ...accessory,
    createdAt: accessory.createdAt instanceof Timestamp ? accessory.createdAt.toDate().toISOString() : (accessory.createdAt as any),
    updatedAt: accessory.updatedAt instanceof Timestamp ? accessory.updatedAt.toDate().toISOString() : (accessory.updatedAt as any),
    comments: (accessory.comments || []).map(comment => ({
      ...comment,
      createdAt: comment.createdAt instanceof Timestamp ? comment.createdAt.toDate().toISOString() : (comment.createdAt as any),
    })),
  };
};

interface AccessoryPageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: AccessoryPageProps): Promise<Metadata> {
  const { id: accessoryId } = params; // Destructure id directly

  if (!accessoryId) {
    return { title: 'Acessório Inválido' };
  }
  const accessory = await getAccessoryById(accessoryId);
  if (!accessory) {
    return { title: 'Acessório Não Encontrado' };
  }
  return {
    title: `${accessory.name} | Detalhes do Acessório`,
    description: accessory.shortDescription || `Detalhes sobre ${accessory.name}.`,
    openGraph: {
        title: accessory.name,
        description: accessory.shortDescription,
        images: accessory.imageUrl ? [{ url: accessory.imageUrl }] : [],
    }
  };
}

export default async function AccessoryDetailPage({ params }: AccessoryPageProps) {
  const { id: accessoryId } = params; // Destructure id directly

  if (!accessoryId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md p-8 text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-2xl font-headline">ID de Acessório Inválido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              O ID do acessório não foi fornecido corretamente na URL.
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

  const accessoryData = await getAccessoryById(accessoryId);

  if (!accessoryData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md p-8 text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-2xl font-headline">Acessório Não Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              O acessório com o ID '{accessoryId}' não foi encontrado.
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

  const clientReadyAccessory = prepareAccessoryForClient(accessoryData);

  return (
    <div className="container mx-auto py-8">
      <AccessoryDetailsClientWrapper accessory={clientReadyAccessory} />
    </div>
  );
}
    