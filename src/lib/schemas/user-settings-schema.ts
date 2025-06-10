
import { z } from 'zod';

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória."),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres."),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "As novas senhas não coincidem.",
  path: ["confirmNewPassword"], // Atribui o erro ao campo de confirmação
});

export type PasswordChangeFormValues = z.infer<typeof PasswordChangeSchema>;

    