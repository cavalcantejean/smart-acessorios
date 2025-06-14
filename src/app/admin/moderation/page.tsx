
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquareWarning, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';
// PendingCommentsList import removed as it's not used for static export

export const metadata: Metadata = {
  title: 'Moderar Conteúdo | Admin SmartAcessorios',
  description: 'Revise e aprove ou rejeite comentários pendentes.',
};

// ClientReadyPendingCommentDisplay and related types/functions removed as comment system is disabled for static export.

export default async function ModerationPage() {
  let fetchError: string | null = "A funcionalidade de moderação de comentários não está disponível com a exportação estática do site. Para moderar comentários, uma configuração de servidor dinâmico é necessária.";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <MessageSquareWarning className="h-8 w-8 text-primary" />
            Moderar Conteúdo
          </h1>
          <p className="text-muted-foreground">Funcionalidade de moderação de comentários desativada para exportação estática.</p>
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
          <CardTitle>Comentários Pendentes</CardTitle>
            <CardDescription className="text-destructive">Funcionalidade Indisponível</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-xl font-semibold text-destructive">Moderação de Comentários Indisponível</p>
              <p className="text-muted-foreground mt-2">{fetchError}</p>
              <p className="text-xs text-muted-foreground mt-4">
                Esta funcionalidade requer um ambiente de servidor dinâmico.
              </p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
