"use client"; // <-- This is the crucial change

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, Users, BarChart3, Loader2, ShieldAlert, ShoppingBag, FileText, Settings, TicketPercent } from 'lucide-react';

// The function is no longer async because it's not a Server Action
export default function DashboardClientPage() {
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
        {/* All your Card components go here... */}
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <ShoppingBag className="h-6 w-6 text-indigo-500" />
              Gerenciar Acessórios
            </CardTitle>
            <CardDescription>Adicione, edite ou remova acessórios e ofertas.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/accessories">Gerenciar Acessórios</Link>
            </Button>
          </CardContent>
        </Card>

        {/* ... other cards ... */}
         <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="h-6 w-6 text-purple-500" />
              Gerenciar Posts do Blog
            </CardTitle>
            <CardDescription>Crie e edite artigos para o blog.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/blog-posts">Gerenciar Blog</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TicketPercent className="h-6 w-6 text-teal-500" />
              Gerenciar Cupons
            </CardTitle>
            <CardDescription>Adicione, edite ou remova cupons promocionais.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/coupons">Gerenciar Cupons</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="h-6 w-6 text-blue-500" />
              Gerenciar Usuários
            </CardTitle>
            <CardDescription>Visualize e gerencie contas de usuários.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/users">Acessar Gerenciamento de Usuários</Link>
            </Button>
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
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/analytics">Ver Analytics</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Settings className="h-6 w-6 text-pink-500" />
              Configurações do Site
            </CardTitle>
            <CardDescription>Ajustes gerais e configurações da plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/admin/settings">Acessar Configurações</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}