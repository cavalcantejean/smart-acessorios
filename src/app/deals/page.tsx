
import { getDailyDeals } from '@/lib/data';
import type { Accessory } from '@/lib/types';
import AccessoryCard from '@/components/AccessoryCard';
import { Tag } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ofertas do Dia | SmartAccessoryLink',
  description: 'Confira as melhores ofertas do dia em acessórios para smartphones.',
};

export default function DealsPage() {
  const dailyDeals: Accessory[] = getDailyDeals();

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Tag className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold font-headline">Ofertas do Dia</h1>
        </div>
        {dailyDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dailyDeals.map(acc => (
              <AccessoryCard key={acc.id} accessory={acc} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            Nenhuma oferta especial encontrada hoje. Volte mais tarde!
          </p>
        )}
      </section>
    </div>
  );
}
