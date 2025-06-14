
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BarChart3, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';
import AnalyticsSummaryCards from './components/AnalyticsSummaryCards';
import AccessoriesByCategoryChart from './components/AccessoriesByCategoryChart';
import { Separator } from '@/components/ui/separator';
import type { AnalyticsData } from '@/lib/types'; // Keep type for component props

export const metadata: Metadata = {
  title: 'Analytics | Admin SmartAcessorios',
  description: 'Visualize estatísticas de uso e engajamento da plataforma.',
};

export default async function AnalyticsPage() {
  // For static export, we cannot reliably use firebase-admin during build.
  // Data will be placeholder or fetched client-side in a dynamic deployment.
  const analyticsData: AnalyticsData = {
    totalUsers: 0,
    totalAccessories: 0,
    accessoriesPerCategory: [],
    // Comment-related fields were already removed from AnalyticsData type
  };

  const isStaticBuild = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true';

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics do Site
          </h1>
          <p className="text-muted-foreground">Visão geral do desempenho e engajamento da plataforma.</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel Admin
          </Link>
        </Button>
      </div>

      {isStaticBuild && (
        <div className="p-4 mb-4 text-sm text-orange-700 bg-orange-100 border border-orange-300 rounded-md flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 mt-0.5 text-orange-700 shrink-0" />
          <div>
            <p className="font-semibold">Modo de Demonstração Estática</p>
            <p>Os dados de analytics exibidos são de placeholder. Em uma implantação dinâmica, estes dados seriam carregados em tempo real.</p>
          </div>
        </div>
      )}

      <AnalyticsSummaryCards
        totalUsers={analyticsData.totalUsers}
        totalAccessories={analyticsData.totalAccessories}
      />

      <Separator className="my-6" />

      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Acessórios por Categoria</CardTitle>
            <CardDescription>Distribuição dos acessórios cadastrados nas diferentes categorias.</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.accessoriesPerCategory && analyticsData.accessoriesPerCategory.length > 0 ? (
              <AccessoriesByCategoryChart data={analyticsData.accessoriesPerCategory} />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {isStaticBuild ? "Dados de categoria não disponíveis em modo estático." : "Nenhum dado de categoria disponível."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
