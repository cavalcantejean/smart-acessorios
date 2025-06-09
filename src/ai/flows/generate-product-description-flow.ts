
'use server';
/**
 * @fileOverview An AI agent that generates product descriptions.
 *
 * - generateProductDescription - A function that generates a product description based on input.
 * - GenerateDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateDescriptionInputSchema = z.object({
  productInfo: z
    .string()
    .min(5, "Product information must be at least 5 characters.")
    .describe('Keywords, product name, or a basic idea to generate the product description from. Example: "fast wireless charger for iPhone and Android, sleek design"'),
});
export type GenerateDescriptionInput = z.infer<typeof GenerateDescriptionInputSchema>;

const GenerateDescriptionOutputSchema = z.object({
  generatedDescription: z
    .string()
    .describe('The AI-generated product description.'),
});
export type GenerateDescriptionOutput = z.infer<typeof GenerateDescriptionOutputSchema>;

export async function generateProductDescription(
  input: GenerateDescriptionInput
): Promise<GenerateDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateDescriptionInputSchema},
  output: {schema: GenerateDescriptionOutputSchema},
  prompt: `You are a creative and persuasive marketing copywriter specializing in e-commerce product descriptions for tech accessories.
Given the following product information (keywords, product name, or a basic idea), generate a compelling and informative product description.

The description should:
- Be engaging and highlight key features and benefits.
- Be suitable for an e-commerce product page.
- Be approximately 2-4 paragraphs long.
- Use clear and concise language.
- Avoid making up features not implied by the input. If the input is very brief, focus on general benefits of such a product.

Product Information:
"{{{productInfo}}}"

Generate the product description.
`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (!output?.generatedDescription) {
        throw new Error("AI failed to generate a description.");
    }
    return output;
  }
);
