
import { z } from 'zod';

// Helper to convert YYYY-MM-DD to ISO string or validate existing ISO string
const dateSchema = z.string().refine((val) => {
    if (!val) return true; // Optional field
    // Check if it's already a valid ISO string part (e.g., from date picker)
    if (!isNaN(new Date(val).getTime())) return true;
    // Check for YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    return regex.test(val) && !isNaN(new Date(val).getTime());
}, {
  message: "Data de publicação inválida. Use YYYY-MM-DD ou deixe em branco para data atual.",
});


export const PostFormSchema = z.object({
  title: z.string().min(5, "O título deve ter pelo menos 5 caracteres."),
  slug: z.string().min(3, "O slug deve ter pelo menos 3 caracteres.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug inválido. Use letras minúsculas, números e hífens."),
  excerpt: z.string().min(10, "O resumo deve ter pelo menos 10 caracteres.").max(300, "O resumo não pode exceder 300 caracteres."),
  content: z.string().min(50, "O conteúdo deve ter pelo menos 50 caracteres."),
  imageUrl: z.string().url("URL da imagem inválida.").min(1, "URL da imagem é obrigatória."),
  imageHint: z.string().optional(),
  authorName: z.string().min(2, "O nome do autor deve ter pelo menos 2 caracteres."),
  authorAvatarUrl: z.string().url("URL do avatar do autor inválida.").optional().or(z.literal('')),
  authorAvatarHint: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional().describe("Tags separadas por vírgula (ex: tecnologia, review, dicas)"),
  publishedAt: dateSchema.optional(),
});

export type PostFormValues = z.infer<typeof PostFormSchema>;
