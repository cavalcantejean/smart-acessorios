
import { getAnalyticsData as getAnalyticsDataAdmin } from '@/lib/data-admin'; 
import type { AnalyticsData } from '@/lib/types'; // RecentCommentInfo removed from here
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import type { Metadata } from 'next';
import AnalyticsSummaryCards from './components/AnalyticsSummaryCards';
import AccessoriesByCategoryChart from './components/AccessoriesByCategoryChart';
// TopItemsList and RecentCommentsList removed
import { Separator } from '@/components/ui/separator';

export const metadata: Metadata = {
  title: 'Analytics | Admin SmartAcessorios',
  description: 'Visualize estatísticas de uso e engajamento da plataforma.',
};

const prepareAnalyticsDataForClient = (data: AnalyticsData): AnalyticsData => {
  return {
    ...data,
    // recentComments mapping removed
  };
};

export default async function AnalyticsPage() {
  const rawAnalyticsData: AnalyticsData = await getAnalyticsDataAdmin();
  const analyticsData = prepareAnalyticsDataForClient(rawAnalyticsData);

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

      <AnalyticsSummaryCards
        totalUsers={analyticsData.totalUsers}
        totalAccessories={analyticsData.totalAccessories}
        // totalComments prop removed
      />

      <Separator className="my-6" />

      <div className="grid grid-cols-1 gap-6"> {/* Simplified grid */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Acessórios por Categoria</CardTitle>
            <CardDescription>Distribuição dos acessórios cadastrados nas diferentes categorias.</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.accessoriesPerCategory && analyticsData.accessoriesPerCategory.length > 0 ? (
              <AccessoriesByCategoryChart data={analyticsData.accessoriesPerCategory} />
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum dado de categoria disponível.</p>
            )}
          </CardContent>
        </Card>

        {/* RecentCommentsList card removed */}
      </div>

      {/* TopItemsList section removed */}
    </div>
  );
}
