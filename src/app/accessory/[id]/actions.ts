
// "use server"; // Removed as Server Actions are not supported with static export
// import { summarizeProductDescription, type SummarizeProductDescriptionInput, type SummarizeProductDescriptionOutput } from '@/ai/flows/summarize-product-description'; // AI Action Removed
// import { z } from 'zod'; // Zod not needed if no actions

// --- Summarize Action --- REMOVED FOR STATIC EXPORT COMPATIBILITY
// const SummarizeInputSchema = z.object({
//   productDescription: z.string().min(1, "Product description cannot be empty."),
// });
// export async function summarizeAccessoryDescriptionAction(input: SummarizeProductDescriptionInput): Promise<SummarizeProductDescriptionOutput> { ... }

// This file is now empty as its Server Action was removed due to incompatibility with static export.
// If client-side data fetching or mutations related to accessory details are needed,
// they should be implemented directly in the client components using the Firebase Client SDK
// or by calling external APIs (e.g., Firebase Cloud Functions).
