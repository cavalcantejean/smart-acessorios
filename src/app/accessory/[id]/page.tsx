
import { getAccessoryByIdAdmin, getAllAccessoriesAdmin } from '@/lib/data-admin';
import type { Accessory } from '@/lib/types'; 
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import AccessoryDetailsClientWrapper from './components/AccessoryDetailsClientWrapper';
// import { Timestamp } from 'firebase/firestore'; // No longer needed
import type { Metadata } from 'next';

// Helper to prepare accessory data for client components
const prepareAccessoryForClient = (accessory: Accessory): any => {
  const convertToISO = (dateField: Date | string | undefined): string | undefined => {
    if (!dateField) return undefined;
    if (typeof dateField === 'string') return dateField; // Assume already ISO string
    if (dateField instanceof Date) return dateField.toISOString();
    // @ts-ignore (covers old client Timestamp if it sneaks in)
    if (dateField.toDate && typeof dateField.toDate === 'function') return dateField.toDate().toISOString();
    return String(dateField); // Fallback, might not be ideal
  };
  return {
    ...accessory,
    createdAt: convertToISO(accessory.createdAt),
    updatedAt: convertToISO(accessory.updatedAt),
    // comments field was removed from Accessory type as per previous logs, ensure this is consistent
    // If comments are still part of Accessory type and have timestamps, they need similar conversion.
  };
};

interface AccessoryPageProps {
  params: { id: string };
}

export async function generateStaticParams() {
  const accessories = await getAllAccessoriesAdmin();
  return accessories.map((accessory) => ({
    id: accessory.id,
  }));
}

export async function generateMetadata({ params }: AccessoryPageProps): Promise<Metadata> {
  const id = params.id; 
  console.log('[generateMetadata] Extracted id:', id);

  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error('[generateMetadata] Error: id is falsy or not a valid string. Value:', id);
    return { title: 'Acessório Inválido (Metadata)' };
  }
  const accessory = await getAccessoryByIdAdmin(id);
  if (!accessory) {
    console.error('[generateMetadata] Error: Accessory not found for ID:', id);
    return { title: 'Acessório Não Encontrado (Metadata)' };
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
  console.log('--- RENDERIZANDO: src/app/accessory/[id]/page.tsx no SERVIDOR ---');
  const id = params.id; 
  console.log('[AccessoryDetailPage] Extracted id:', id);

  if (!id || typeof id !== 'string' || id.trim() === '') {
    console.error('[AccessoryDetailPage] Error: id is falsy or not a valid string. Value:', id);
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

  const accessoryData = await getAccessoryByIdAdmin(id);

  if (!accessoryData) {
    console.error('[AccessoryDetailPage] Error: Accessory not found for ID:', id);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md p-8 text-center">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-2xl font-headline">Acessório Não Encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              O acessório com o ID '{id}' não foi encontrado.
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
