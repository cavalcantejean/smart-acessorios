
import { getDailyDealsAdmin } from '@/lib/data-admin'; // Now async
import type { Accessory } from '@/lib/types'; // Comment removed
import AccessoryCard from '@/components/AccessoryCard';
import { Tag } from 'lucide-react';
import type { Metadata } from 'next';
// import { Timestamp } from 'firebase/firestore'; // No longer needed

export const metadata: Metadata = {
  title: 'Ofertas do Dia | SmartAcessorios',
  description: 'Confira as melhores ofertas do dia em acessórios para smartphones.',
};

// Helper to prepare accessory for client (convert Timestamps to strings)
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
    // comments field is no longer part of Accessory type, so remove mapping
  };
};

export default async function DealsPage() {
  const rawDeals: Accessory[] = await getDailyDealsAdmin(); // Await async call
  const dailyDeals = rawDeals.map(prepareAccessoryForClient);

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
