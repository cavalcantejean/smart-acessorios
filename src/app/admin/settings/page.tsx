
import { getSiteSettings, getBaseSocialLinkSettings } from '@/lib/data';
import type { SiteSettings, SocialLinkSetting } from '@/lib/types'; // Keep SiteSettings for general structure
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

// Define a type for the data being passed to the client component
// This excludes non-serializable parts like IconComponent
interface SerializableSocialLinkForForm {
  platform: string;
  label: string;
  url: string;
  placeholderUrl: string;
}

export interface SettingsFormDataForClient {
  siteTitle: string;
  siteDescription: string;
  socialLinks: SerializableSocialLinkForForm[];
}


export default async function SiteSettingsPage() {
  const currentSettings = getSiteSettings(); 
  const baseSocialLinks = getBaseSocialLinkSettings(); // This has IconComponent, used for labels/placeholders

  // Prepare data specifically for the client component, stripping non-serializable parts
  const initialDataForForm: SettingsFormDataForClient = {
    siteTitle: currentSettings.siteTitle,
    siteDescription: currentSettings.siteDescription,
    socialLinks: baseSocialLinks.map(baseLink => {
      const currentLinkData = currentSettings.socialLinks.find(sl => sl.platform === baseLink.platform);
      return {
        platform: baseLink.platform,
        label: baseLink.label,
        url: currentLinkData?.url || '', // Use current URL if available, else empty
        placeholderUrl: baseLink.placeholderUrl,
        // IconComponent is NOT included here
      };
    }),
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
