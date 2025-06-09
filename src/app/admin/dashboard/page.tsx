
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, MessageSquareWarning, BarChart3, Loader2, ShieldAlert } from 'lucide-react';
import type { Metadata } from 'next';

// Metadata for client components is typically handled by parent layouts or a generateMetadata function if it were a server component.
// For client pages, we can set document.title if needed.

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.replace('/login?message=Admin%20access%20required');
    }
    if (!isLoading && isAuthenticated && isAdmin && user) {
        document.title = `Admin: ${user.name} | SmartAcessorios`;
    }
  }, [isLoading, isAuthenticated, isAdmin, router, user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Verificando permissões...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    // This state is mostly for the brief moment before redirection or if redirection fails.
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
        <p className="text-muted-foreground mb-6">
          Você não tem permissão para acessar esta página. Redirecionando...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            Painel do Administrador
          </h1>
          <p className="text-muted-foreground">Bem-vindo(a), {user?.name}! Gerencie o SmartAcessorios aqui.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-6 w-6 text-blue-500" />
              Gerenciar Usuários
            </CardTitle>
            <CardDescription>Visualize e gerencie contas de usuários.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline" disabled>
              <Link href="/admin/users">Acessar Gerenciamento de Usuários</Link>
            </Button>
            <p className="text-xs text-center mt-2 text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquareWarning className="h-6 w-6 text-orange-500" />
              Moderar Conteúdo
            </CardTitle>
            <CardDescription>Revise comentários e outros conteúdos gerados por usuários.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline" disabled>
              <Link href="/admin/moderation">Acessar Moderação</Link>
            </Button>
            <p className="text-xs text-center mt-2 text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-6 w-6 text-green-500" />
              Analytics do Site
            </CardTitle>
            <CardDescription>Visualize estatísticas de uso e engajamento.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline" disabled>
              <Link href="/admin/analytics">Ver Analytics</Link>
            </Button>
             <p className="text-xs text-center mt-2 text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LayoutDashboard className="h-6 w-6 text-indigo-500" />
              Gerenciar Acessórios
            </CardTitle>
            <CardDescription>Adicione, edite ou remova acessórios e ofertas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline" disabled>
              <Link href="/admin/accessories">Gerenciar Acessórios</Link>
            </Button>
             <p className="text-xs text-center mt-2 text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LayoutDashboard className="h-6 w-6 text-purple-500" />
              Gerenciar Posts do Blog
            </CardTitle>
            <CardDescription>Crie e edite artigos para o blog.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline" disabled>
              <Link href="/admin/blog-posts">Gerenciar Blog</Link>
            </Button>
             <p className="text-xs text-center mt-2 text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <LayoutDashboard className="h-6 w-6 text-pink-500" />
              Configurações do Site
            </CardTitle>
            <CardDescription>Ajustes gerais e configurações da plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline" disabled>
              <Link href="/admin/settings">Acessar Configurações</Link>
            </Button>
             <p className="text-xs text-center mt-2 text-muted-foreground">Em breve</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
