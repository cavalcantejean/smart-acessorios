
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
  console.log("[GENKIT_FLOW_SERVER] generateProductDescription (wrapper) chamada com input:", input);
  return generateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateDescriptionInputSchema},
  output: {schema: GenerateDescriptionOutputSchema},
  prompt: `Você é um redator de marketing criativo e persuasivo, especializado em descrições de produtos de e-commerce para acessórios de tecnologia.
**Sua resposta DEVE ser em português brasileiro.**

Dadas as seguintes informações sobre o produto (palavras-chave, nome do produto ou uma ideia básica), gere uma descrição de produto atraente e informativa.

A descrição deve:
- Ser envolvente e destacar os principais recursos e benefícios.
- Ser adequada para uma página de produto de e-commerce.
- Ter aproximadamente 2-4 parágrafos.
- Usar linguagem clara e concisa.
- Evitar inventar recursos não implícitos na entrada. Se a entrada for muito breve, concentre-se nos benefícios gerais de tal produto.
- **O texto gerado deve estar inteiramente em português brasileiro.**

Informações sobre o produto:
"{{{productInfo}}}"

Gere a descrição do produto em português brasileiro.
`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateDescriptionInputSchema,
    outputSchema: GenerateDescriptionOutputSchema,
  },
  async (input) => {
    console.log("[GENKIT_FLOW_SERVER] generateProductDescriptionFlow INICIADO com input:", input);
    try {
      console.log("[GENKIT_FLOW_SERVER] Chamando o prompt Genkit...");
      const {output} = await prompt(input);
      console.log("[GENKIT_FLOW_SERVER] Resposta do prompt Genkit:", output);

      if (!output?.generatedDescription) {
          console.error("[GENKIT_FLOW_SERVER] Falha da IA: descrição gerada é nula ou vazia.");
          throw new Error("AI failed to generate a description. Output was null or description empty.");
      }
      console.log("[GENKIT_FLOW_SERVER] Descrição gerada com sucesso pelo Genkit.");
      return output;
    } catch (error) {
      console.error("[GENKIT_FLOW_SERVER] Erro dentro do fluxo Genkit:", error);
      throw error; // Re-throw para ser capturado pela Server Action
    }
  }
);


    