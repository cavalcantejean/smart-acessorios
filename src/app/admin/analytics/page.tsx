
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Loader2, ShieldAlert } from 'lucide-react';

export default function AnalyticsPage() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      router.replace('/login?message=Admin%20access%20required');
    }
    if (!isLoading && isAuthenticated && isAdmin && user) {
        document.title = `Analytics | Admin SmartAcessorios`;
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics do Site
          </h1>
          <p className="text-muted-foreground">Visualize estatísticas de uso e engajamento.</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel Admin
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Estatísticas Principais</CardTitle>
          <CardDescription>
            Esta seção exibirá gráficos e dados sobre o tráfego do site, usuários ativos, acessórios mais vistos, etc.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-xl font-semibold text-muted-foreground">
            Funcionalidade de Analytics em Desenvolvimento
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Em breve, você poderá visualizar dados detalhados sobre o desempenho do seu site aqui.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
