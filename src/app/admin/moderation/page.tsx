
import { getPendingComments } from '@/lib/data';
import type { PendingCommentDisplay } from '@/lib/types';
import PendingCommentsList from './components/PendingCommentsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquareWarning } from 'lucide-react';
import type { Metadata } from 'next';

// Note: Auth checks for admin pages are typically handled in a layout or higher-order component.
// For this page, we'll assume the admin layout handles redirection if not admin.

export const metadata: Metadata = {
  title: 'Moderar Conteúdo | Admin SmartAcessorios',
  description: 'Revise e aprove ou rejeite comentários pendentes.',
};

export default async function ModerationPage() {
  // In a real app, ensure only admins can access this page.
  // This could be done via middleware or a layout component.
  const pendingComments: PendingCommentDisplay[] = getPendingComments();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <MessageSquareWarning className="h-8 w-8 text-primary" />
            Moderar Conteúdo
          </h1>
          <p className="text-muted-foreground">Revise comentários pendentes de aprovação.</p>
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
          <CardDescription>
            Total de comentários aguardando moderação: {pendingComments.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PendingCommentsList initialPendingComments={pendingComments} />
        </CardContent>
      </Card>
    </div>
  );
}
