
import { z } from 'zod';

export const CouponFormSchema = z.object({
  code: z.string().min(3, "O código deve ter pelo menos 3 caracteres.").max(50, "O código não pode exceder 50 caracteres."),
  description: z.string().min(5, "A descrição deve ter pelo menos 5 caracteres.").max(200, "A descrição não pode exceder 200 caracteres."),
  discount: z.string().min(1, "O valor/tipo do desconto é obrigatório (ex: 20% OFF, R$10, Frete Grátis)."),
  expiryDate: z.string().optional().refine((val) => {
    if (!val) return true; // Permite string vazia ou undefined
    // Verifica se é uma data válida no formato YYYY-MM-DD e se não está no passado (apenas dia, sem hora)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(val)) return false;
    const inputDate = new Date(val + "T00:00:00"); // Adiciona tempo para evitar problemas de fuso horário na comparação de "hoje"
    if (isNaN(inputDate.getTime())) return false;
    
    // Compara apenas a data, ignorando a hora
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera a hora de hoje para comparação justa
    
    return inputDate >= today;
  }, {
    message: "Data de validade inválida ou no passado. Use o formato YYYY-MM-DD ou deixe em branco."
  }),
  store: z.string().max(100, "O nome da loja não pode exceder 100 caracteres.").optional(),
  applyUrl: z.string().url("URL de aplicação inválida. Use o formato https://...").optional().or(z.literal('')),
});

export type CouponFormValues = z.infer<typeof CouponFormSchema>;
