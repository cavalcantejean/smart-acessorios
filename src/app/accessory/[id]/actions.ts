
"use server";
import { summarizeProductDescription, type SummarizeProductDescriptionInput, type SummarizeProductDescriptionOutput } from '@/ai/flows/summarize-product-description';
import { z } from 'zod';
import { addCommentToAccessory as addCommentToAccessoryData, toggleLikeOnAccessory as toggleLikeOnAccessoryData, getAccessoryById } from '@/lib/data';
import type { Comment } from '@/lib/types';
// For server actions, we can't directly use useAuth. Authentication needs to be handled differently.
// For this mock, we'll simulate getting a user or require userId to be passed if needed.
// In a real app, you'd use your auth library's server-side utilities.

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
  userId: z.string(), // Assuming userId is passed from client after auth check
});

interface LikeActionResult {
  success: boolean;
  isLiked: boolean;
  likesCount: number;
  message?: string;
}

export async function toggleLikeAccessoryAction(formData: FormData): Promise<LikeActionResult> {
  const accessoryId = formData.get('accessoryId') as string;
  const userId = formData.get('userId') as string; // Client ensures this is present for logged-in user

  if (!userId) {
    return { success: false, isLiked: false, likesCount: 0, message: "Usuário não autenticado." };
  }
  if (!accessoryId) {
    return { success: false, isLiked: false, likesCount: 0, message: "ID do acessório ausente." };
  }

  const result = toggleLikeOnAccessoryData(accessoryId, userId);
  const accessory = getAccessoryById(accessoryId); // Re-fetch to get the current state

  if (!result || !accessory) {
    return { success: false, isLiked: false, likesCount: accessory?.likedBy.length || 0, message: "Falha ao curtir/descurtir." };
  }

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
  comment?: Comment;
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
    const newComment = addCommentToAccessoryData(accessoryId, userId, userName, commentText);
    if (!newComment) {
      return { success: false, error: "Falha ao adicionar comentário." };
    }
    return { success: true, comment: newComment, message: "Comentário adicionado!" };
  } catch (error) {
    console.error("Error in addCommentAccessoryAction:", error);
    return { success: false, error: "Erro no servidor ao adicionar comentário." };
  }
}
