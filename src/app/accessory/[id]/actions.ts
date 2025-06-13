
"use server";
import { summarizeProductDescription, type SummarizeProductDescriptionInput, type SummarizeProductDescriptionOutput } from '@/ai/flows/summarize-product-description';
import { z } from 'zod';
// Removed: addCommentToAccessoryData, toggleLikeOnAccessoryData, getAccessoryById, checkAndAwardBadges
// Removed: Comment type, Timestamp

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

// --- Like Action --- REMOVED
// toggleLikeAccessoryAction REMOVED

// --- Comment Action --- REMOVED
// addCommentAccessoryAction REMOVED
