
import { getPendingComments } from '@/lib/data'; // Now async
import type { PendingCommentDisplay } from '@/lib/types';
import PendingCommentsList from './components/PendingCommentsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquareWarning } from 'lucide-react';
import type { Metadata } from 'next';
import { Timestamp } from 'firebase/firestore';

export const metadata: Metadata = {
  title: 'Moderar Conteúdo | Admin SmartAcessorios',
  description: 'Revise e aprove ou rejeite comentários pendentes.',
};

// Helper to convert Timestamp to string for client components
const preparePendingCommentForClient = (pendingComment: PendingCommentDisplay): PendingCommentDisplay => {
  return {
    ...pendingComment,
    comment: {
      ...pendingComment.comment,
      createdAt: pendingComment.comment.createdAt instanceof Timestamp
                 ? pendingComment.comment.createdAt.toDate().toISOString()
                 : pendingComment.comment.createdAt as any, // Assume it might already be string
    }
  };
};


export default async function ModerationPage() {
  const rawPendingComments: PendingCommentDisplay[] = await getPendingComments(); // Await async call
  const pendingComments = rawPendingComments.map(preparePendingCommentForClient);

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
