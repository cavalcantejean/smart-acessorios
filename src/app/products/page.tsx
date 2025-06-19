
import { getAllAccessoriesAdmin } from '@/lib/data-admin';
import type { Accessory } from '@/lib/types'; // Comment type removed
import AccessoryCard from '@/components/AccessoryCard';
import { ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';
// import { Timestamp } from 'firebase/firestore'; // No longer needed

export const metadata: Metadata = {
  title: 'Todos os Produtos | SmartAcessorios',
  description: 'Navegue por todos os nossos acessórios para smartphones.',
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


export default async function ProductsPage() {
  console.log('--- RENDERIZANDO: src/app/products/page.tsx no SERVIDOR ---');
  const rawAccessories: Accessory[] = await getAllAccessoriesAdmin();
  const allAccessories = rawAccessories.map(prepareAccessoryForClient);


  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-6">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline">Todos os Produtos</h1>
        </div>
        {allAccessories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allAccessories.map(acc => (
              <AccessoryCard key={acc.id} accessory={acc} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            Nenhum produto encontrado.
          </p>
        )}
      </section>
    </div>
  );
}
