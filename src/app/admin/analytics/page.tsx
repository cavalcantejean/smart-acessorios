
import { getAnalyticsData, type AnalyticsData } from '@/lib/data'; // Now async
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, BarChart3 } from 'lucide-react'; // Removed unused icons
import type { Metadata } from 'next';
import AnalyticsSummaryCards from './components/AnalyticsSummaryCards';
import AccessoriesByCategoryChart from './components/AccessoriesByCategoryChart';
import TopItemsList from './components/TopItemsList';
import RecentCommentsList from './components/RecentCommentsList';
import { Separator } from '@/components/ui/separator';
import { Timestamp } from 'firebase/firestore';

export const metadata: Metadata = {
  title: 'Analytics | Admin SmartAcessorios',
  description: 'Visualize estatísticas de uso e engajamento da plataforma.',
};

// Helper to ensure dates in recentComments are strings for client components
const prepareAnalyticsDataForClient = (data: AnalyticsData): AnalyticsData => {
  return {
    ...data,
    recentComments: (data.recentComments || []).map(comment => ({
      ...comment,
      // createdAt is already string in RecentCommentInfo type, but good to be sure
      createdAt: typeof comment.createdAt === 'string' ? comment.createdAt : new Date(comment.createdAt).toISOString(),
    })),
  };
};


export default async function AnalyticsPage() {
  const rawAnalyticsData: AnalyticsData = await getAnalyticsData(); // Await async call
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
        totalComments={analyticsData.totalApprovedComments}
      />

      <Separator className="my-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Acessórios por Categoria</CardTitle>
            <CardDescription>Distribuição dos acessórios cadastrados nas diferentes categorias.</CardDescription>
          </CardHeader>
          <CardContent>
            {analyticsData.accessoriesPerCategory.length > 0 ? (
              <AccessoriesByCategoryChart data={analyticsData.accessoriesPerCategory} />
            ) : (
              <p className="text-muted-foreground text-center py-8">Nenhum dado de categoria disponível.</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Comentários Recentes</CardTitle>
            <CardDescription>Últimos comentários aprovados na plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentCommentsList comments={analyticsData.recentComments} />
          </CardContent>
        </Card>
      </div>

      <Separator className="my-6" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopItemsList
          title="Acessórios Mais Curtidos"
          items={analyticsData.mostLikedAccessories}
          itemType="curtida"
        />
        <TopItemsList
          title="Acessórios Mais Comentados"
          items={analyticsData.mostCommentedAccessories}
          itemType="comentário"
        />
      </div>
    </div>
  );
}
