
"use client";

import { useEffect, useState } from 'react';
import { getAllAccessories } from '@/lib/data';
import type { Accessory } from '@/lib/types';
import AccessoryCard from '@/components/AccessoryCard';
import { useFavorites } from '@/hooks/useFavorites';
import { Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function FavoritesPage() {
  const { favoriteIds } = useFavorites();
  const [allAccessories, setAllAccessories] = useState<Accessory[]>([]);
  const { isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace('/login'); // Usar replace para não adicionar ao histórico de navegação
    }
  }, [isAuthenticated, isLoadingAuth, router]);

  useEffect(() => {
    // Carregar acessórios apenas se autenticado e o carregamento de auth estiver concluído
    if (isAuthenticated && !isLoadingAuth) {
      setAllAccessories(getAllAccessories());
    }
  }, [isAuthenticated, isLoadingAuth]);

  const favoritedAccessories = allAccessories.filter(acc => favoriteIds.includes(acc.id));

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando seus favoritos...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Este estado pode ser brevemente visível antes do redirecionamento ou se o redirecionamento falhar
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
        <p className="text-muted-foreground mb-6">
          Você precisa estar logado para ver seus acessórios favoritos.
        </p>
        <Button onClick={() => router.push('/login')}>
          Ir para a Página de Login
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-center gap-2 mb-6">
          <Heart className="h-8 w-8 text-destructive" />
          <h1 className="text-3xl font-bold text-center font-headline">Seus Favoritos</h1>
        </div>
        {favoritedAccessories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoritedAccessories.map(acc => (
              <AccessoryCard key={acc.id} accessory={acc} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-10">
            Você ainda não favoritou nenhum acessório. Navegue pelos acessórios e clique no ícone de coração para salvá-los aqui!
          </p>
        )}
      </section>
    </div>
  );
}
