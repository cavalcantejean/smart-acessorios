
import { getPendingComments } from '@/lib/data-admin'; // Changed to data-admin as it uses admin SDK for reads
import type { PendingCommentDisplay, Comment } from '@/lib/types';
import PendingCommentsList from './components/PendingCommentsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquareWarning } from 'lucide-react';
import type { Metadata } from 'next';
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore'; // Use AdminTimestamp

export const metadata: Metadata = {
  title: 'Moderar Conteúdo | Admin SmartAcessorios',
  description: 'Revise e aprove ou rejeite comentários pendentes.',
};

// Helper to convert AdminTimestamp to string for client components
// Note: getPendingComments from data-admin already returns createdAt as AdminTimestamp within comment object
const preparePendingCommentForClient = (pendingComment: PendingCommentDisplay): PendingCommentDisplay & { comment: { createdAt: string }} => {
  const comment = pendingComment.comment as Comment & { createdAt: AdminTimestamp | string };
  return {
    ...pendingComment,
    comment: {
      ...comment,
      createdAt: comment.createdAt instanceof Object && 'toDate' in comment.createdAt
                 ? (comment.createdAt as AdminTimestamp).toDate().toISOString()
                 : (typeof comment.createdAt === 'string' ? comment.createdAt : new Date().toISOString()),
    }
  };
};


export default async function ModerationPage() {
  const rawPendingComments: PendingCommentDisplay[] = await getPendingComments();
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
          <PendingCommentsList initialPendingComments={pendingComments as any} />
        </CardContent>
      </Card>
    </div>
  );
}
