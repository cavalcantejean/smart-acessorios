
import { getAllAccessoriesAdmin } from '@/lib/data-admin';
import type { Accessory } from '@/lib/types';
import AccessoriesTable from './components/AccessoriesTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag, PlusCircle } from 'lucide-react';
import type { Metadata } from 'next';
// import { Timestamp } from 'firebase/firestore'; // No longer needed

export const metadata: Metadata = {
  title: 'Gerenciar Acessórios | Admin SmartAcessorios',
  description: 'Adicione, edite ou remova acessórios da plataforma.',
};

const prepareAccessoryForClient = (accessory: Accessory): Accessory => {
  const convertToISO = (dateField: Date | string | undefined): string | undefined => {
    if (!dateField) return undefined;
    if (typeof dateField === 'string') return dateField; // Assume already ISO string
    if (dateField instanceof Date) return dateField.toISOString();
    // Fallback for any other unexpected type
    return String(dateField);
  };
  return {
    ...accessory,
    createdAt: convertToISO(accessory.createdAt),
    updatedAt: convertToISO(accessory.updatedAt),
  };
};

export default async function ManageAccessoriesPage() {
  console.log('--- RENDERIZANDO: src/app/admin/accessories/page.tsx no SERVIDOR ---');
  const rawAccessories: Accessory[] = await getAllAccessoriesAdmin();
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
            <AccessoriesTable initialAccessories={accessories} isStaticExport={false} />
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
