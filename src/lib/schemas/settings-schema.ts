
import { z } from 'zod';

export const SocialLinkSettingSchema = z.object({
  platform: z.string(),
  label: z.string(),
  url: z.string().url("URL inválida. Deixe em branco se não quiser exibir este link.").or(z.literal('')).optional(),
  customImageUrl: z.string().url("URL da imagem customizada inválida.").or(z.literal('')).optional(), // For data URI or actual URL
  // IconComponent and placeholderUrl are not part of the form data submission but used for rendering/logic
});

export const SettingsFormSchema = z.object({
  siteTitle: z.string().min(3, "O título do site deve ter pelo menos 3 caracteres.").max(60, "O título do site não pode exceder 60 caracteres."),
  siteDescription: z.string().min(10, "A descrição do site deve ter pelo menos 10 caracteres.").max(160, "A descrição do site não pode exceder 160 caracteres."),
  socialLinks: z.array(SocialLinkSettingSchema),
});

export type SettingsFormValues = z.infer<typeof SettingsFormSchema>;
