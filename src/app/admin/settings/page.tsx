
import { getSiteSettings, getBaseSocialLinkSettings } from '@/lib/data';
import type { SiteSettings, SocialLinkSetting } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import type { Metadata } from 'next';
import SettingsForm from './components/SettingsForm';
import { updateSettingsAction } from './actions';

export const metadata: Metadata = {
  title: 'Configurações do Site | Admin SmartAcessorios',
  description: 'Gerencie as configurações gerais do site.',
};

// This interface is for the data passed to the client component form.
// It includes everything the form needs to render, including fallbacks.
export interface SocialLinkFormData {
  platform: string;
  label: string;
  url: string;
  placeholderUrl: string;
  customImageUrl?: string;
  // IconComponent is NOT passed to client, client will look it up if needed for fallback display
}

export interface SettingsFormDataForClient {
  siteTitle: string;
  siteDescription: string;
  socialLinks: SocialLinkFormData[];
}


export default async function SiteSettingsPage() {
  const currentSettings = getSiteSettings(); // This has IconComponent and customImageUrl from data store
  
  // Prepare data specifically for the client component form.
  // We pass all necessary display and value data.
  const initialDataForForm: SettingsFormDataForClient = {
    siteTitle: currentSettings.siteTitle,
    siteDescription: currentSettings.siteDescription,
    socialLinks: currentSettings.socialLinks.map(link => ({
      platform: link.platform,
      label: link.label, // Label comes from currentSettings (which is from base)
      url: link.url || '',
      placeholderUrl: link.placeholderUrl, // placeholderUrl from currentSettings
      customImageUrl: link.customImageUrl || '',
      // IconComponent is NOT included here for client component props
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            Configurações do Site
          </h1>
          <p className="text-muted-foreground">Gerencie as configurações gerais da plataforma.</p>
        </div>
        <Button variant="outline" asChild size="sm">
          <Link href="/admin/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Painel
          </Link>
        </Button>
      </div>
      
      <SettingsForm 
        formAction={updateSettingsAction} 
        initialData={initialDataForForm} 
      />
    </div>
  );
}
