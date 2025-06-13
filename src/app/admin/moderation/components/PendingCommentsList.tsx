
"use client";

import { useState, useEffect, useActionState, startTransition } from 'react';
// Use the ClientReadyPendingCommentDisplay type from the parent page
import type { ClientReadyPendingCommentDisplay } from '../page';
import { approveCommentAction, rejectCommentAction, type ModerationActionResult } from '../actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, MessageSquare, Loader2, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface PendingCommentsListProps {
  initialPendingComments: ClientReadyPendingCommentDisplay[];
}

const initialActionState: ModerationActionResult = { success: false };

export default function PendingCommentsList({ initialPendingComments }: PendingCommentsListProps) {
  const [pendingComments, setPendingComments] = useState<ClientReadyPendingCommentDisplay[]>(initialPendingComments);
  const [approveState, handleApproveAction, isApprovePending] = useActionState(approveCommentAction, initialActionState);
  const [rejectState, handleRejectAction, isRejectPending] = useActionState(rejectCommentAction, initialActionState);
  const { toast } = useToast();
  
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    setPendingComments(initialPendingComments);
  }, [initialPendingComments]);

  useEffect(() => {
    const handleState = (state: ModerationActionResult | null, actionType: 'aprovado' | 'rejeitado') => {
      if (!state) return;

      if (state.success && state.moderatedCommentId) {
        toast({
          title: "Sucesso!",
          description: state.message || `Comentário ${actionType} com sucesso.`,
        });
        setPendingComments(prevComments => 
          prevComments.filter(pc => pc.comment.id !== state.moderatedCommentId)
        );
      } else if (!state.success && state.error) {
        toast({
          title: "Erro",
          description: state.error,
          variant: "destructive",
        });
      }
      if (state.moderatedCommentId === processingId) {
        setProcessingId(null);
      }
    };

    handleState(approveState, 'aprovado');
  }, [approveState, toast, processingId]);

  useEffect(() => {
    const handleState = (state: ModerationActionResult | null, actionType: 'aprovado' | 'rejeitado') => {
      if (!state) return;

      if (state.success && state.moderatedCommentId) {
        toast({
          title: "Sucesso!",
          description: state.message || `Comentário ${actionType} com sucesso.`,
        });
        setPendingComments(prevComments => 
          prevComments.filter(pc => pc.comment.id !== state.moderatedCommentId)
        );
      } else if (!state.success && state.error) {
        toast({
          title: "Erro",
          description: state.error,
          variant: "destructive",
        });
      }
      if (state.moderatedCommentId === processingId) {
        setProcessingId(null);
      }
    };
     handleState(rejectState, 'rejeitado');
  }, [rejectState, toast, processingId]);


  const onApprove = (commentId: string, accessoryId: string) => {
    const formData = new FormData();
    formData.append('commentId', commentId);
    formData.append('accessoryId', accessoryId);
    setProcessingId(commentId);
    startTransition(() => handleApproveAction(formData));
  };

  const onReject = (commentId: string, accessoryId: string) => {
    const formData = new FormData();
    formData.append('commentId', commentId);
    formData.append('accessoryId', accessoryId);
    setProcessingId(commentId);
    startTransition(() => handleRejectAction(formData));
  };

  const formatDate = (dateString: string) => {
    // dateString is now expected to be an ISO string
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (pendingComments.length === 0) {
    return (
      <div className="text-center py-10">
        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Nenhum comentário pendente de moderação.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingComments.map(({ comment, accessoryId, accessoryName }) => (
        <Card key={comment.id} className="shadow-md">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <UserCircle className="h-5 w-5 text-muted-foreground"/> 
                        Comentário de: {comment.userName}
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                        Em: <Link href={`/accessory/${accessoryId}`} target="_blank" className="text-primary hover:underline">{accessoryName}</Link>
                        {' - '}Postado em: {formatDate(comment.createdAt)}
                    </CardDescription>
                </div>
                 <Badge variant="outline" className="text-orange-600 border-orange-400">Pendente</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground whitespace-pre-line bg-muted/30 p-3 rounded-md">{comment.text}</p>
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(comment.id, accessoryId)}
              disabled={isRejectPending && processingId === comment.id || isApprovePending && processingId === comment.id}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/50"
            >
              {(isRejectPending && processingId === comment.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
              Rejeitar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onApprove(comment.id, accessoryId)}
              disabled={isApprovePending && processingId === comment.id || isRejectPending && processingId === comment.id}
              className="text-green-600 hover:bg-green-500/10 hover:text-green-700 border-green-500/50"
            >
              {(isApprovePending && processingId === comment.id) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
              Aprovar
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
