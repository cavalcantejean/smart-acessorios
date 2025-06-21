"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import type { Accessory } from '@/lib/types';
import AccessoriesTable from './components/AccessoriesTable';
import { Loader2 } from 'lucide-react';

interface ManageAccessoriesClientProps {
  initialAccessories: Accessory[];
}

export default function ManageAccessoriesClient({ initialAccessories }: ManageAccessoriesClientProps) {
  const { isAdmin, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  console.log(`%cManageClient: RENDER. isLoading=${isLoading}, isAdmin=${isAdmin}`, 'color: red; font-weight: bold;');

  useEffect(() => {
    console.log(`%cManageClient: useEffect EXECUTADO. isLoading=${isLoading}, isAdmin=${isAdmin}`, 'color: brown;');
    if (!isLoading && !isAdmin) {
      console.error('%cManageClient: CONDIÇÃO DE REDIRECIONAMENTO ATINGIDA! Tentando navegar...', 'font-size: 14px; background: red; color: white;');
      router.replace('/login?message=Acesso negado');
    }
  }, [isLoading, isAdmin, router]);
  
  if (isLoading || !isAdmin) {
    console.log('%cManageClient: Mostrando tela de Loading/Permissão.', 'color: red;');
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground mt-4">Verificando permissões...</p>
      </div>
    );
  }

  console.log('%cManageClient: Renderizando conteúdo de Admin.', 'color: red;');
  return (
    <AccessoriesTable 
      initialAccessories={initialAccessories} 
      isAuthenticated={isAuthenticated}
    />
  );
}