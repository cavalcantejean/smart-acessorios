
"use client";

import type { Comment } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, MessageCircle } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";
import { addCommentAccessoryAction } from "@/app/accessory/[id]/actions";
import { useToast } from "@/hooks/use-toast";

interface CommentsSectionProps {
  accessoryId: string;
  comments: Comment[];
  onCommentAdded: (newComment: Comment) => void; 
}

const commentFormSchema = z.object({
  commentText: z.string().min(1, "O comentário não pode estar vazio.").max(500, "O comentário não pode exceder 500 caracteres."),
});
type CommentFormValues = z.infer<typeof commentFormSchema>;

interface CommentActionResult {
  success: boolean;
  comment?: Comment;
  message?: string;
  error?: string;
  errors?: Record<string, string[] | undefined>;
}

const initialActionState: CommentActionResult = { success: false };

export default function CommentsSection({ accessoryId, comments: initialComments, onCommentAdded }: CommentsSectionProps) {
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuth();
  const [state, formAction, isPending] = useActionState(addCommentAccessoryAction, initialActionState);
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      commentText: "",
    },
  });

  useEffect(() => {
    if (state?.success && state.comment) {
      if (state.comment.status === 'approved') {
        toast({ title: "Sucesso!", description: state.message || "Comentário adicionado." });
        onCommentAdded(state.comment); // Add to visible list
      } else if (state.comment.status === 'pending_review') {
        toast({ 
          title: "Moderação Pendente", 
          description: state.message || "Seu comentário foi enviado para moderação e será publicado após aprovação.",
          duration: 5000, // Longer duration for this message
        });
        // Do NOT call onCommentAdded for pending comments, as they shouldn't be visible yet.
      }
      form.reset();
    } else if (state && !state.success && (state.error || state.errors)) {
      toast({
        title: "Erro",
        description: state.error || "Falha ao adicionar comentário. Verifique os campos.",
        variant: "destructive",
      });
      if (state.errors?.commentText) {
        form.setError("commentText", { type: "server", message: state.errors.commentText.join(", ") });
      }
    }
  }, [state, toast, form, onCommentAdded]);

  const onSubmit = (data: CommentFormValues) => {
    if (!isAuthenticated || !user) {
      toast({ title: "Erro", description: "Você precisa estar logado para comentar.", variant: "destructive" });
      return;
    }
    const formData = new FormData();
    formData.append("accessoryId", accessoryId);
    formData.append("commentText", data.commentText);
    formData.append("userId", user.id);
    formData.append("userName", user.name);
    formAction(formData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const approvedComments = initialComments.filter(comment => comment.status === 'approved');

  return (
    <div className="space-y-6 pt-6 border-t mt-6">
      <h3 className="text-xl font-semibold flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-primary" />
        Comentários ({approvedComments.length})
      </h3>
      {isAuthenticated ? (
        <Form {...form}>
          <form ref={formRef} action={formAction} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="commentText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="commentText" className="sr-only">Seu comentário</FormLabel>
                  <FormControl>
                    <Textarea
                      id="commentText"
                      placeholder="Deixe seu comentário construtivo..."
                      rows={3}
                      {...field}
                      className="bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <input type="hidden" name="accessoryId" value={accessoryId} />
            {user && <input type="hidden" name="userId" value={user.id} />}
            {user && <input type="hidden" name="userName" value={user.name} />}
            
            <Button type="submit" disabled={isPending || isLoadingAuth} className="bg-accent hover:bg-accent/90">
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enviar Comentário
            </Button>
             {state && !state.success && state.error && Object.keys(form.formState.errors).length === 0 && (
                 <p className="text-sm font-medium text-destructive">{state.error}</p>
            )}
          </form>
        </Form>
      ) : (
        <p className="text-muted-foreground">
          Você precisa estar <a href="/login" className="text-primary hover:underline">logado</a> para deixar um comentário.
        </p>
      )}

      <div className="space-y-4">
        {approvedComments.length > 0 ? (
          approvedComments.slice().reverse().map(comment => ( 
            <div key={comment.id} className="p-4 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm text-primary">{comment.userName}</p>
                <p className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</p>
              </div>
              <p className="text-sm text-card-foreground whitespace-pre-line">{comment.text}</p>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground text-sm">Nenhum comentário aprovado ainda. Seja o primeiro a comentar ou aguarde a moderação!</p>
        )}
      </div>
    </div>
  );
}
