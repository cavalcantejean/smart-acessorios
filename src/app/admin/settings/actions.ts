'use server';

import { revalidatePath } from 'next/cache';
import { SettingsFormSchema, type SettingsFormValues } from '@/lib/schemas/settings-schema';
import { updateSiteSettingsAdmin } from '@/lib/data-admin';
import type { SiteSettings, SocialLinkSetting } from '@/lib/types';

export interface SettingsActionResult {
  success: boolean;
  message: string;
  error?: string | { [key: string]: string[] } | { socialLinks?: ({ platform?: string[], url?: string[], label?: string[], customImageUrl?: string[] } | string)[] };
  settings?: SiteSettings;
}

// Utility to reconstruct socialLinks array and process FormData
const processSettingsFormData = (formData: FormData): Record<string, any> => {
  const data: { [key: string]: any } = {};
  const socialLinks: Partial<SocialLinkSetting>[] = [];
  const socialLinkIndices = new Set<string>();

  formData.forEach((value, key) => {
    const socialLinkMatch = key.match(/^socialLinks\[(\d+)\]\.(platform|url|label|customImageUrl)$/);
    if (socialLinkMatch) {
      const index = socialLinkMatch[1];
      const field = socialLinkMatch[2];
      socialLinkIndices.add(index);
      if (!socialLinks[parseInt(index)]) {
        socialLinks[parseInt(index)] = {};
      }
      (socialLinks[parseInt(index)] as any)[field] = value === '' ? null : value; // Handle empty strings as null or keep as empty
    } else {
      data[key] = value;
    }
  });

  // Filter out any potentially empty/undefined items from socialLinks array
  data.socialLinks = Array.from(socialLinkIndices)
    .map(index => socialLinks[parseInt(index)])
    .filter(link => link && (link.platform || link.url || link.label || link.customImageUrl));

  // Ensure other fields are present, even if empty, for schema validation
  data.siteTitle = formData.get('siteTitle') || "";
  data.siteDescription = formData.get('siteDescription') || "";
  data.siteLogoUrl = formData.get('siteLogoUrl') || null; // Schema allows null
  data.siteFaviconUrl = formData.get('siteFaviconUrl') || null; // Schema allows null

  return data;
};

export async function updateSettingsAction(
  prevState: SettingsActionResult | undefined,
  formData: FormData
): Promise<SettingsActionResult> {
  // Note: Authentication/Authorization should be enforced, ideally within data-admin.ts

  const rawData = processSettingsFormData(formData);
  const validatedFields = SettingsFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const fieldErrors = validatedFields.error.flatten().fieldErrors;
    console.error("Validation Error (Update Settings):", fieldErrors);
    return {
      success: false,
      message: "Erro de validação. Verifique os campos das configurações.",
      error: fieldErrors,
    };
  }

  try {
    // updateSiteSettingsAdmin expects Partial<SiteSettings>
    // The validatedFields.data should conform to SettingsFormValues, which is compatible.
    const updatedSettings = await updateSiteSettingsAdmin(validatedFields.data);

    revalidatePath('/admin/settings');
    revalidatePath('/'); // Revalidate home page and potentially all pages if layout uses these settings
    // Consider revalidating other specific paths if settings are deeply integrated.

    return {
      success: true,
      message: 'Configurações do site atualizadas com sucesso!',
      settings: updatedSettings,
    };
  } catch (e: any) {
    console.error("Error in updateSettingsAction:", e);
    return {
      success: false,
      message: `Falha ao atualizar configurações: ${e.message || 'Erro desconhecido do servidor.'}`,
      error: e.message || 'Erro desconhecido do servidor.',
    };
  }
}
