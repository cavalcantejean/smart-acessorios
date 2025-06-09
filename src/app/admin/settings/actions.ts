
"use server";

import { z } from 'zod';
import { SettingsFormSchema, type SettingsFormValues } from '@/lib/schemas/settings-schema';
import { getSiteSettings, updateSiteSettings, getBaseSocialLinkSettings } from '@/lib/data';
import type { SiteSettings, SocialLinkSetting } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export interface SettingsActionResult {
  success: boolean;
  message?: string;
  error?: string;
  errors?: z.ZodIssue[];
  updatedSettings?: SiteSettings;
}

export async function updateSettingsAction(
  prevState: SettingsActionResult | null,
  formData: FormData
): Promise<SettingsActionResult> {
  const rawFormData: Record<string, any> = {
    siteTitle: formData.get('siteTitle'),
    siteDescription: formData.get('siteDescription'),
    socialLinks: [],
  };

  const baseLinks = getBaseSocialLinkSettings(); // To know how many links to expect
  const submittedSocialLinks: Partial<SettingsFormValues['socialLinks'][0]>[] = [];

  baseLinks.forEach((_, index) => {
    const platform = formData.get(`socialLinks[${index}].platform`) as string;
    const label = formData.get(`socialLinks[${index}].label`) as string; // Label is also submitted
    const url = formData.get(`socialLinks[${index}].url`) as string;
    const customImageUrl = formData.get(`socialLinks[${index}].customImageUrl`) as string;

    if (platform) { // Platform must exist
      submittedSocialLinks.push({ platform, label, url, customImageUrl });
    }
  });
  rawFormData.socialLinks = submittedSocialLinks;

  const validatedFields = SettingsFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten().fieldErrors);
    return {
      success: false,
      message: "Falha na validação. Verifique os campos.",
      errors: validatedFields.error.errors,
      error: "Dados inválidos. Corrija os erros abaixo."
    };
  }

  try {
    const currentSettings = getSiteSettings();
    
    // Map over current settings to preserve IconComponent and placeholderUrl,
    // then update with validated data.
    const updatedSocialLinks = currentSettings.socialLinks.map(currentLink => {
      const submittedLink = validatedFields.data.socialLinks.find(sl => sl.platform === currentLink.platform);
      return {
        ...currentLink, // Keeps IconComponent, placeholderUrl, and original label
        url: submittedLink?.url || '',
        customImageUrl: submittedLink?.customImageUrl || '', // Update custom image URL
        label: submittedLink?.label || currentLink.label, // Update label if submitted
      };
    });

    const newSettingsData: SiteSettings = {
      siteTitle: validatedFields.data.siteTitle,
      siteDescription: validatedFields.data.siteDescription,
      socialLinks: updatedSocialLinks,
    };
    
    const updatedSettings = updateSiteSettings(newSettingsData);

    revalidatePath('/admin/settings');
    revalidatePath('/'); 
    revalidatePath('/layout'); 

    return {
      success: true,
      message: "Configurações do site atualizadas com sucesso!",
      updatedSettings,
    };
  } catch (error) {
    console.error("Error in updateSettingsAction:", error);
    return { success: false, error: "Erro no servidor ao tentar atualizar as configurações." };
  }
}
