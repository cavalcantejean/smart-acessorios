
import { getAllAccessories } from '@/lib/data';
import type { Accessory } from '@/lib/types';
import AccessoryCard from '@/components/AccessoryCard';
import { ShoppingBag } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Todos os Produtos | SmartAccessoryLink',
  description: 'Navegue por todos os nossos acessórios para smartphones.',
};

export default function ProductsPage() {
  const allAccessories: Accessory[] = getAllAccessories();

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
