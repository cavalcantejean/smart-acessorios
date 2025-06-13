
"use server";

import { z } from 'zod';
import { updateCommentStatus } from '@/lib/data-admin';
import { revalidatePath } from 'next/cache';
import type { Comment } from '@/lib/types'; // Import Comment type

const ModerateCommentSchema = z.object({
  commentId: z.string().min(1, "ID do comentário é obrigatório."),
  accessoryId: z.string().min(1, "ID do acessório é obrigatório."),
});

export interface ModerationActionResult {
  success: boolean;
  message?: string;
  error?: string;
  moderatedCommentId?: string;
  newStatus?: 'approved' | 'rejected';
}

async function performModeration(
  decision: 'approved' | 'rejected',
  formData: FormData
): Promise<ModerationActionResult> {
  const rawFormData = {
    commentId: formData.get('commentId'),
    accessoryId: formData.get('accessoryId'),
  };

  const validatedFields = ModerateCommentSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Dados inválidos: " + validatedFields.error.flatten().fieldErrors.commentId?.join(', ') + "; " + validatedFields.error.flatten().fieldErrors.accessoryId?.join(', '),
    };
  }

  const { commentId, accessoryId } = validatedFields.data;

  try {
    const updatedComment: Comment | null = await updateCommentStatus(accessoryId, commentId, decision); 

    if (!updatedComment) {
      return { success: false, error: `Falha ao ${decision === 'approved' ? 'aprovar' : 'rejeitar'} comentário. Comentário não encontrado.`, moderatedCommentId: commentId };
    }

    revalidatePath('/admin/moderation');
    revalidatePath(`/accessory/${accessoryId}`);

    return {
      success: true,
      message: `Comentário ${updatedComment.id} foi ${decision === 'approved' ? 'aprovado' : 'rejeitado'}.`,
      moderatedCommentId: updatedComment.id,
      newStatus: decision,
    };
  } catch (error) {
    console.error(`Error in ${decision === 'approved' ? 'approve' : 'reject'}CommentAction:`, error);
    return {
        success: false,
        error: `Ocorreu um erro no servidor ao tentar ${decision === 'approved' ? 'aprovar' : 'rejeitar'} o comentário.`,
        moderatedCommentId: commentId
    };
  }
}

export async function approveCommentAction(
  prevState: ModerationActionResult | null,
  formData: FormData
): Promise<ModerationActionResult> {
  return performModeration('approved', formData);
}

export async function rejectCommentAction(
  prevState: ModerationActionResult | null,
  formData: FormData
): Promise<ModerationActionResult> {
  return performModeration('rejected', formData);
}
    
