
// 'use server'; // This directive is not strictly necessary for Genkit flows if not directly exposed as Server Actions
/**
 * @fileOverview An AI agent that summarizes product descriptions from affiliate links.
 * This flow is intended to be called from a server environment (e.g., Firebase Cloud Function)
 * if used in a statically exported Next.js app.
 *
 * - summarizeProductDescription - A function that summarizes the product description.
 * - SummarizeProductDescriptionInput - The input type for the summarizeProductDescription function.
 * - SummarizeProductDescriptionOutput - The return type for the summarizeProductDescription function.
 */

// import {ai} from '@/ai/genkit';
// import {z} from 'genkit';

// const SummarizeProductDescriptionInputSchema = z.object({
//   productDescription: z
//     .string()
//     .describe('The full product description to be summarized.'),
// });
// export type SummarizeProductDescriptionInput = z.infer<
//   typeof SummarizeProductDescriptionInputSchema
// >;

// const SummarizeProductDescriptionOutputSchema = z.object({
//   summary: z
//     .string()
//     .describe('A concise summary of the product description.'),
// });
// export type SummarizeProductDescriptionOutput = z.infer<
//   typeof SummarizeProductDescriptionOutputSchema
// >;

// export async function summarizeProductDescription(
//   input: SummarizeProductDescriptionInput
// ): Promise<SummarizeProductDescriptionOutput> {
//   return summarizeProductDescriptionFlow(input);
// }

// const prompt = ai.definePrompt({
//   name: 'summarizeProductDescriptionPrompt',
//   input: {schema: SummarizeProductDescriptionInputSchema},
//   output: {schema: SummarizeProductDescriptionOutputSchema},
//   prompt: `Summarize the following product description, focusing on key features and benefits:\n\n{{{productDescription}}}`,
// });

// const summarizeProductDescriptionFlow = ai.defineFlow(
//   {
//     name: 'summarizeProductDescriptionFlow',
//     inputSchema: SummarizeProductDescriptionInputSchema,
//     outputSchema: SummarizeProductDescriptionOutputSchema,
//   },
//   async input => {
//     const response = await prompt(input);
//     const output = response.output;

//     if (!output || typeof output.summary !== 'string' || output.summary.trim() === "") {
//       console.error("Summarize flow: AI failed to produce a valid summary object or summary string was empty.", output);
//       throw new Error("AI failed to generate a valid summary.");
//     }
//     return output;
//   }
// );

// Content of this file is commented out as it's not used by any active Server Action
// due to incompatibility with `output: 'export'`.
// If this flow is needed, it should be deployed as a Firebase Cloud Function or similar
// and called from the client-side.
export {}; // Add an empty export to make it a module
