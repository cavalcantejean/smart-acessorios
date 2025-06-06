"use server";
import { summarizeProductDescription, type SummarizeProductDescriptionInput, type SummarizeProductDescriptionOutput } from '@/ai/flows/summarize-product-description';
import { z } from 'zod';

const InputSchema = z.object({
  productDescription: z.string().min(1, "Product description cannot be empty."),
});

export async function summarizeAccessoryDescriptionAction(input: SummarizeProductDescriptionInput): Promise<SummarizeProductDescriptionOutput> {
  const validationResult = InputSchema.safeParse(input);
  if (!validationResult.success) {
    // Consider how to handle errors. For now, throwing an error.
    // In a real app, you might return a structured error object.
    throw new Error(`Invalid input: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
  }

  try {
    const summaryOutput = await summarizeProductDescription(validationResult.data);
    return summaryOutput;
  } catch (error) {
    console.error("Error in summarizeAccessoryDescriptionAction:", error);
    // Re-throw or return a structured error
    throw new Error("Failed to generate summary. Please try again later.");
  }
}
