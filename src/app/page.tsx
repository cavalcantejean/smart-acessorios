import { getAllAccessories } from '@/lib/data';
import AccessoryCard from '@/components/AccessoryCard';
import type { Accessory } from '@/lib/types';

export default function HomePage() {
  const accessories: Accessory[] = getAllAccessories();

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold mb-6 text-center font-headline">Discover Accessories</h1>
        {accessories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {accessories.map(acc => (
              <AccessoryCard key={acc.id} accessory={acc} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No accessories found.</p>
        )}
      </section>
    </div>
  );
}
