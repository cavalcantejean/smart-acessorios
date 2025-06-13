
import { getPendingComments } from '@/lib/data-admin';
import type { PendingCommentDisplay, Comment } from '@/lib/types';
import PendingCommentsList from './components/PendingCommentsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquareWarning, AlertTriangle } from 'lucide-react'; // Added AlertTriangle
import type { Metadata } from 'next';
import type { Timestamp as AdminTimestamp } from 'firebase-admin/firestore';
import type { Timestamp as ClientTimestamp } from 'firebase/firestore'; // For client-side type hints

export const metadata: Metadata = {
  title: 'Moderar Conteúdo | Admin SmartAcessorios',
  description: 'Revise e aprove ou rejeite comentários pendentes.',
};

interface ClientReadyComment extends Omit<Comment, 'createdAt'> {
  createdAt: string;
}

interface ClientReadyPendingCommentDisplay extends Omit<PendingCommentDisplay, 'comment'> {
  comment: ClientReadyComment;
}

const preparePendingCommentForClient = (
  pendingComment: PendingCommentDisplay | null | undefined
): ClientReadyPendingCommentDisplay | null => {
  if (!pendingComment || !pendingComment.comment) {
    console.warn('Invalid pendingComment data (missing comment object):', pendingComment);
    return null;
  }

  const originalComment = pendingComment.comment;

  if (!originalComment.createdAt) {
    console.warn('Invalid pendingComment data (missing createdAt):', pendingComment);
    // Fallback: create a comment with a default date or skip
    return {
      ...pendingComment,
      comment: {
        ...originalComment,
        id: originalComment.id || 'unknown-id-' + Math.random().toString(36).substring(7),
        userId: originalComment.userId || 'unknown-user',
        userName: originalComment.userName || 'Usuário Desconhecido',
        text: originalComment.text || '',
        status: originalComment.status || 'pending_review',
        createdAt: new Date().toISOString(), // Fallback createdAt
      },
    } as ClientReadyPendingCommentDisplay;
  }

  const createdAtVal = originalComment.createdAt;
  let isoCreatedAt: string;

  if (typeof createdAtVal === 'string') {
    const parsedDate = new Date(createdAtVal);
    if (!isNaN(parsedDate.getTime())) {
      isoCreatedAt = parsedDate.toISOString();
    } else {
      console.warn(`preparePendingCommentForClient: Could not parse date string: ${createdAtVal} for comment ID ${originalComment.id}`);
      isoCreatedAt = new Date().toISOString(); // Fallback
    }
  } else if (createdAtVal && typeof createdAtVal === 'object' && typeof (createdAtVal as any).toDate === 'function') {
    // Handles both Firebase client Timestamp and Admin Timestamp (duck typing)
    isoCreatedAt = (createdAtVal as AdminTimestamp | ClientTimestamp).toDate().toISOString();
  } else {
    console.warn(`preparePendingCommentForClient: Unhandled createdAt type for comment ID ${originalComment.id}:`, createdAtVal);
    isoCreatedAt = new Date().toISOString(); // Fallback
  }

  return {
    ...pendingComment,
    comment: {
      ...originalComment,
      createdAt: isoCreatedAt,
    },
  } as ClientReadyPendingCommentDisplay;
};


export default async function ModerationPage() {
  let rawPendingComments: PendingCommentDisplay[] = [];
  let fetchError: string | null = null;

  try {
    rawPendingComments = await getPendingComments();
  } catch (error: any) {
    console.error("Error fetching pending comments for ModerationPage:", error);
    fetchError = "Falha ao carregar comentários pendentes. Verifique a configuração do servidor ou tente novamente mais tarde.";
    if (error.message && error.message.includes("Firebase Admin SDK not initialized")) {
        fetchError = "Erro crítico: O serviço de administração não está configurado corretamente para buscar comentários. Verifique as credenciais do Firebase Admin no ambiente de build/servidor.";
    } else if (error.message) {
        fetchError = `Erro ao buscar comentários: ${error.message}`;
    }
  }

  const pendingComments: ClientReadyPendingCommentDisplay[] = rawPendingComments
    .map(preparePendingCommentForClient)
    .filter(Boolean) as ClientReadyPendingCommentDisplay[];

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
          {fetchError ? (
            <CardDescription className="text-destructive">Falha ao carregar</CardDescription>
          ) : (
            <CardDescription>
              Total de comentários aguardando moderação: {pendingComments.length}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {fetchError ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
              <p className="text-xl font-semibold text-destructive">Erro ao Carregar Comentários</p>
              <p className="text-muted-foreground mt-2">{fetchError}</p>
              <p className="text-xs text-muted-foreground mt-4">
                Se o problema persistir, contate o administrador do sistema.
              </p>
            </div>
          ) : (
            <PendingCommentsList initialPendingComments={pendingComments as any} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
