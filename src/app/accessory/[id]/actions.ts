
"use server";
import { summarizeProductDescription, type SummarizeProductDescriptionInput, type SummarizeProductDescriptionOutput } from '@/ai/flows/summarize-product-description';
import { moderateComment, type ModerateCommentInput, type ModerateCommentOutput } from '@/ai/flows/moderate-comment-flow';
import { z } from 'zod';
import { addCommentToAccessoryData, toggleLikeOnAccessory as toggleLikeOnAccessoryData, getAccessoryById, checkAndAwardBadges } from '@/lib/data';
import type { Comment } from '@/lib/types';

// --- Summarize Action ---
const SummarizeInputSchema = z.object({
  productDescription: z.string().min(1, "Product description cannot be empty."),
});

export async function summarizeAccessoryDescriptionAction(input: SummarizeProductDescriptionInput): Promise<SummarizeProductDescriptionOutput> {
  const validationResult = SummarizeInputSchema.safeParse(input);
  if (!validationResult.success) {
    throw new Error(`Invalid input for summary: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
  }

  try {
    const summaryOutput = await summarizeProductDescription(validationResult.data);
    return summaryOutput;
  } catch (error) {
    console.error("Error in summarizeAccessoryDescriptionAction:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
}

// --- Like Action ---
const LikeActionInputSchema = z.object({
  accessoryId: z.string(),
  userId: z.string(), 
});

interface LikeActionResult {
  success: boolean;
  isLiked: boolean;
  likesCount: number;
  message?: string;
}

export async function toggleLikeAccessoryAction(formData: FormData): Promise<LikeActionResult> {
  const accessoryId = formData.get('accessoryId') as string;
  const userId = formData.get('userId') as string; 

  if (!userId) {
    return { success: false, isLiked: false, likesCount: 0, message: "Usuário não autenticado." };
  }
  if (!accessoryId) {
    return { success: false, isLiked: false, likesCount: 0, message: "ID do acessório ausente." };
  }

  const result = toggleLikeOnAccessoryData(accessoryId, userId);
  const accessory = getAccessoryById(accessoryId); 

  if (!result || !accessory) {
    return { success: false, isLiked: false, likesCount: accessory?.likedBy.length || 0, message: "Falha ao curtir/descurtir." };
  }
  
  // Check for badges after liking/unliking (already handled in toggleLikeOnAccessoryData)
  // checkAndAwardBadges(userId); // This call is now inside toggleLikeOnAccessoryData

  return {
    success: true,
    isLiked: accessory.likedBy.includes(userId),
    likesCount: accessory.likedBy.length,
    message: accessory.likedBy.includes(userId) ? "Curtido!" : "Descurtido.",
  };
}


// --- Comment Action ---
const CommentActionInputSchema = z.object({
  accessoryId: z.string(),
  commentText: z.string().min(1, "O comentário não pode estar vazio.").max(500, "Comentário muito longo."),
  userId: z.string(),
  userName: z.string(),
});

interface CommentActionResult {
  success: boolean;
  comment?: Comment; // This will now include the status
  message?: string;
  error?: string;
  errors?: Record<string, string[] | undefined>;
}

export async function addCommentAccessoryAction(prevState: CommentActionResult | null, formData: FormData): Promise<CommentActionResult> {
  const rawFormData = {
    accessoryId: formData.get('accessoryId'),
    commentText: formData.get('commentText'),
    userId: formData.get('userId'),
    userName: formData.get('userName'),
  };

  const validatedFields = CommentActionInputSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    return {
      success: false,
      error: "Dados inválidos.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  
  const { accessoryId, commentText, userId, userName } = validatedFields.data;

  try {
    // Step 1: Moderate the comment
    const moderationResult = await moderateComment({ commentText });
    
    let commentStatus: 'approved' | 'pending_review' = 'approved';
    let userMessage = "Comentário adicionado!";

    if (!moderationResult.isSafe) {
      commentStatus = 'pending_review';
      userMessage = "Seu comentário foi enviado para moderação e será publicado após aprovação.";
      console.log(`Comment by ${userName} on ${accessoryId} flagged as pending: ${moderationResult.reason}`);
    }

    // Step 2: Add comment to data store with its status
    const newComment = addCommentToAccessoryData(accessoryId, userId, userName, commentText, commentStatus);
    
    if (!newComment) {
      return { success: false, error: "Falha ao adicionar comentário." };
    }

    // Step 3: Check and award badges if comment is approved (already handled in addCommentToAccessoryData)
    // if (commentStatus === 'approved') {
    //   checkAndAwardBadges(userId); // This call is now inside addCommentToAccessoryData
    // }

    return { success: true, comment: newComment, message: userMessage };

  } catch (error) {
    console.error("Error in addCommentAccessoryAction:", error);
    if (error instanceof Error && error.message.includes("Moderation")) { 
        return { success: false, error: "Falha no sistema de moderação. Tente novamente." };
    }
    return { success: false, error: "Erro no servidor ao adicionar comentário." };
  }
}
