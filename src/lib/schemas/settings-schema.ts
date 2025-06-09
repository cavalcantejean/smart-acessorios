
import { z } from 'zod';

export const SocialLinkSettingSchema = z.object({
  platform: z.string(),
  label: z.string(),
  url: z.string().url("URL inválida. Deixe em branco se não quiser exibir este link.").or(z.literal('')).optional(),
  customImageUrl: z.string().url("URL da imagem customizada inválida.").or(z.literal('')).optional(),
});

export const SettingsFormSchema = z.object({
  siteTitle: z.string().min(3, "O título do site deve ter pelo menos 3 caracteres.").max(60, "O título do site não pode exceder 60 caracteres."),
  siteDescription: z.string().min(10, "A descrição do site deve ter pelo menos 10 caracteres.").max(160, "A descrição do site não pode exceder 160 caracteres."),
  siteLogoUrl: z.string().url("URL do logo inválida. Use uma URL de imagem (data URI após upload).").or(z.literal('')).optional(),
  siteFaviconUrl: z.string().url("URL do favicon inválida. Use uma URL de imagem (data URI após upload).").or(z.literal('')).optional(),
  socialLinks: z.array(SocialLinkSettingSchema),
});

export type SettingsFormValues = z.infer<typeof SettingsFormSchema>;
