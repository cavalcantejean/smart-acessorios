
import { getPendingComments, type PendingCommentDisplayWithISOStringDate } from '@/lib/data-admin';
import type { Comment } from '@/lib/types'; // Base Comment type with Timestamp
import PendingCommentsList from './components/PendingCommentsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, MessageSquareWarning, AlertTriangle } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moderar Conteúdo | Admin SmartAcessorios',
  description: 'Revise e aprove ou rejeite comentários pendentes.',
};

// This is the type that PendingCommentsList component expects
// It's derived from Comment, but createdAt is always a string (ISO)
export interface ClientReadyComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  status: 'pending_review' | 'approved' | 'rejected';
  createdAt: string; // ISO string
}

export interface ClientReadyPendingCommentDisplay {
  comment: ClientReadyComment;
  accessoryId: string;
  accessoryName: string;
}

// This function converts the data fetched by getPendingComments
// (which already has createdAt as string) into the ClientReadyPendingCommentDisplay structure,
// ensuring all fields are present with fallbacks.
const preparePendingCommentForClient = (
  pendingCommentInput: PendingCommentDisplayWithISOStringDate | null | undefined
): ClientReadyPendingCommentDisplay | null => {
  if (!pendingCommentInput || !pendingCommentInput.comment) {
    console.warn('preparePendingCommentForClient: Invalid input (missing comment object):', pendingCommentInput);
    return null;
  }

  const { comment: inputComment, accessoryId, accessoryName } = pendingCommentInput;

  // Validate if createdAt is a parsable date string, otherwise fallback
  let validatedIsoCreatedAt: string = inputComment.createdAt;
  if (typeof validatedIsoCreatedAt !== 'string' || isNaN(new Date(validatedIsoCreatedAt).getTime())) {
    console.warn(`preparePendingCommentForClient: Malformed or non-string createdAt for comment ID ${inputComment.id || 'unknown'}: ${validatedIsoCreatedAt}. Using current date as fallback.`);
    validatedIsoCreatedAt = new Date().toISOString();
  }

  const clientReadyComment: ClientReadyComment = {
    id: inputComment.id || `unknown-id-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId: inputComment.userId || 'unknown-user',
    userName: inputComment.userName || 'Usuário Desconhecido',
    text: inputComment.text || '',
    status: inputComment.status || 'pending_review', // status should be 'pending_review' from query
    createdAt: validatedIsoCreatedAt,
  };

  return {
    comment: clientReadyComment,
    accessoryId: accessoryId,
    accessoryName: accessoryName,
  };
};


export default async function ModerationPage() {
  let rawPendingComments: PendingCommentDisplayWithISOStringDate[] = [];
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
            <PendingCommentsList initialPendingComments={pendingComments} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
