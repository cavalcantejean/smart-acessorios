
import { getSiteSettings, getBaseSocialLinkSettings } from '@/lib/data';
import type { SiteSettings } from '@/lib/types';
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

export default async function SiteSettingsPage() {
  // Fetch initial settings to pass to the form
  // We need the full social link definitions including IconComponent for the form labels
  const currentSettings = getSiteSettings(); // Gets URLs
  const baseSocialLinks = getBaseSocialLinkSettings(); // Gets structure with Icons

  const initialDataForForm: SiteSettings = {
    ...currentSettings,
    socialLinks: baseSocialLinks.map(baseLink => {
      const currentLink = currentSettings.socialLinks.find(sl => sl.platform === baseLink.platform);
      return {
        ...baseLink, // This has IconComponent and placeholderUrl
        url: currentLink?.url || '', // Use current URL if available
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
