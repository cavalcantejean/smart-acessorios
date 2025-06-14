
import { getSiteSettings, getBaseSocialLinkSettings } from '@/lib/data';
import type { SiteSettings, SocialLinkSetting } from '@/lib/types'; 
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import type { Metadata } from 'next';
import SettingsForm from './components/SettingsForm';
// updateSettingsAction removed

export const metadata: Metadata = {
  title: 'Configurações do Site | Admin SmartAcessorios',
  description: 'Gerencie as configurações gerais do site.',
};

export interface SocialLinkFormData {
  platform: string;
  label: string;
  url: string; 
  placeholderUrl: string; 
  customImageUrl?: string; 
}

export interface SettingsFormDataForClient {
  siteTitle: string;
  siteDescription: string;
  siteLogoUrl?: string;
  siteFaviconUrl?: string;
  socialLinks: SocialLinkFormData[];
}


export default async function SiteSettingsPage() {
  const currentSettings: SiteSettings = await getSiteSettings(); 
  const baseSocialLinks = getBaseSocialLinkSettings(); 
  
  const mergedSocialLinks: SocialLinkFormData[] = baseSocialLinks.map(baseLink => {
    const currentLinkData = currentSettings.socialLinks.find(cs => cs.platform === baseLink.platform);
    return {
      platform: baseLink.platform,
      label: baseLink.label, 
      placeholderUrl: baseLink.placeholderUrl, 
      url: currentLinkData?.url || "", 
      customImageUrl: currentLinkData?.customImageUrl || "", 
    };
  });
  
  const initialDataForForm: SettingsFormDataForClient = {
    siteTitle: currentSettings.siteTitle,
    siteDescription: currentSettings.siteDescription,
    siteLogoUrl: currentSettings.siteLogoUrl || '',
    siteFaviconUrl: currentSettings.siteFaviconUrl || '',
    socialLinks: mergedSocialLinks,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Configurações do Site
          </h1>
          <p className="text-muted-foreground">Gerencie as configurações gerais da plataforma. (Salvamento desativado para exportação estática).</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel
          </Link>
        </Button>
      </div>
      
      <SettingsForm 
        // formAction prop removed
        initialData={initialDataForForm} 
        isStaticExport={true}
      />
    </div>
  );
}
