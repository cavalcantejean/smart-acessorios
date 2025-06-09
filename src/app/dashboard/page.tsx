
"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Heart, Settings, LogOut, Loader2 } from 'lucide-react';
import type { Metadata } from 'next';

// Metadata can't be dynamically set in client components like this directly.
// Next.js encourages using generateMetadata for server components.
// For client components, you might update document.title in useEffect if needed.
// export const metadata: Metadata = {
//   title: 'Painel do Usuário | SmartAcessorios',
//   description: 'Gerencie sua conta e preferências.',
// };

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        document.title = user ? `${user.name} - Painel | SmartAcessorios` : 'Painel do Usuário | SmartAcessorios';
    }
  }, [user]);


  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando dados do usuário...</p>
      </div>
    );
  }

  if (!user) {
    // This case should ideally be covered by the redirect, but as a fallback.
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
            <p className="text-muted-foreground">Usuário não encontrado. Redirecionando...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Painel de {user.name}</h1>
          <p className="text-muted-foreground">Bem-vindo(a) de volta! Gerencie sua conta aqui.</p>
        </div>
        <Button variant="outline" onClick={() => { logout(); router.push('/'); }} size="sm">
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Informações da Conta
          </CardTitle>
          <CardDescription>Seus dados cadastrais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p><strong>Nome:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Tipo de Conta:</strong> {user.isAdmin ? 'Administrador' : 'Usuário Comum'}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              Meus Favoritos
            </CardTitle>
            <CardDescription>Acesse seus acessórios salvos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/favorites">Ver Favoritos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              Configurações (Em Breve)
            </CardTitle>
            <CardDescription>Gerencie suas preferências e dados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Acessar Configurações
            </Button>
            <p className="text-xs text-center mt-2 text-muted-foreground">Funcionalidade em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
