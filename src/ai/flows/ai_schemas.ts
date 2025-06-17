// src/ai/flows/ai_schemas.ts
import {z} from 'genkit'; // Or 'zod' if that's more appropriate and genkit's z is just a re-export for its own types

export const GenerateDescriptionInputSchema = z.object({
  productInfo: z
    .string()
    .min(5, "Product information must be at least 5 characters.")
    .describe('Keywords, product name, or a basic idea to generate the product description from. Example: "fast wireless charger for iPhone and Android, sleek design"'),
});
export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;

export const GenerateDescriptionOutputSchema = z.object({
  generatedDescription: z
    .string()
    .describe('The AI-generated product description.'),
});
export type GenerateDescriptionOutput = z.infer<typeof GenerateDescriptionOutputSchema>;