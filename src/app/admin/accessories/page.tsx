
import { getAllAccessories } from '@/lib/data'; // Now async
import type { Accessory, Comment } from '@/lib/types';
import AccessoriesTable from './components/AccessoriesTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, PlusCircle } from 'lucide-react';
import type { Metadata } from 'next';
import { Timestamp } from 'firebase/firestore';

export const metadata: Metadata = {
  title: 'Gerenciar Acessórios | Admin SmartAcessorios',
  description: 'Adicione, edite ou remova acessórios da plataforma.',
};

// Helper to prepare accessory for client (convert Timestamps to strings)
const prepareAccessoryForClient = (accessory: Accessory): Accessory => {
  return {
    ...accessory,
    createdAt: accessory.createdAt instanceof Timestamp ? accessory.createdAt.toDate().toISOString() : (accessory.createdAt as any),
    updatedAt: accessory.updatedAt instanceof Timestamp ? accessory.updatedAt.toDate().toISOString() : (accessory.updatedAt as any),
    comments: (accessory.comments || []).map(comment => ({
      ...comment,
      createdAt: comment.createdAt instanceof Timestamp ? comment.createdAt.toDate().toISOString() : (comment.createdAt as any),
    })),
  } as Accessory; // Cast to ensure type compatibility where client component expects strings
};

export default async function ManageAccessoriesPage() {
  const rawAccessories: Accessory[] = await getAllAccessories(); // Await the async call
  const accessories = rawAccessories.map(prepareAccessoryForClient);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-primary" />
            Gerenciar Acessórios
          </h1>
          <p className="text-muted-foreground">Adicione, edite ou remova acessórios da plataforma.</p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" asChild size="sm">
            <Link href="/admin/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Painel
            </Link>
            </Button>
            <Button asChild size="sm">
            <Link href="/admin/accessories/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Novo
            </Link>
            </Button>
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Acessórios</CardTitle>
          <CardDescription>
            Total de acessórios cadastrados: {accessories.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accessories.length > 0 ? (
            <AccessoriesTable initialAccessories={accessories} />
          ) : (
            <div className="text-center py-10">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum acessório cadastrado ainda.</p>
              <Button asChild className="mt-4">
                <Link href="/admin/accessories/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Acessório
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
