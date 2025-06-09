
import { z } from 'zod';

export const AccessoryFormSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  shortDescription: z.string().min(10, "A descrição curta deve ter pelo menos 10 caracteres."),
  fullDescription: z.string().min(20, "A descrição completa deve ter pelo menos 20 caracteres."),
  imageUrl: z.string().url("URL da imagem inválida.").min(1, "URL da imagem é obrigatória."),
  imageHint: z.string().optional(),
  affiliateLink: z.string().url("Link de afiliado inválido.").min(1, "Link de afiliado é obrigatório."),
  price: z.string()
    .optional()
    .refine(val => {
      if (val === undefined || val === null || val.trim() === "") return true; // Optional and empty string is allowed
      const num = parseFloat(val.replace(',', '.'));
      return !isNaN(num) && num >= 0;
    }, {
      message: "Preço inválido. Deve ser um número positivo. Use formato como 12,99 ou 12.99"
    }),
  category: z.string().optional(),
  isDeal: z.boolean().optional().default(false),
  aiSummary: z.string().optional(),
});

export type AccessoryFormValues = z.infer<typeof AccessoryFormSchema>;
