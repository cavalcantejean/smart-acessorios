
import { getAllErrorReports } from '@/lib/data';
import type { ErrorReport } from '@/lib/types';
import ErrorReportsTable from './components/ErrorReportsTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Bug } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Relatórios de Erros | Admin SmartAcessorios',
  description: 'Visualize e gerencie erros reportados na plataforma.',
};

export default async function ManageErrorReportsPage() {
  // Auth check for admin should be in a layout or middleware
  const errorReports: ErrorReport[] = getAllErrorReports();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <Bug className="h-8 w-8 text-destructive" />
            Relatórios de Erros do Site
          </h1>
          <p className="text-muted-foreground">Acompanhe e gerencie os erros reportados pelos usuários ou pelo sistema.</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Lista de Erros Reportados</CardTitle>
          <CardDescription>
            Total de relatórios de erro: {errorReports.length}. Priorize os erros com status "Novo".
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorReports.length > 0 ? (
            <ErrorReportsTable initialErrorReports={errorReports} />
          ) : (
            <div className="text-center py-10">
              <Bug className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Nenhum erro reportado até o momento. Tudo parece estar funcionando bem!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
