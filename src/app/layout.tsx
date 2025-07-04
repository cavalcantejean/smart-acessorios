
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import ClientProviders from '@/components/ClientProviders';
import { getSiteSettingsAdmin } from '@/lib/data-admin'; 
import { getBaseSocialLinkSettings } from '@/lib/site-utils';
import type { SiteSettingsForClient, SocialLinkSetting, SerializableSocialLinkSetting } from '@/lib/types'; 
import NavigationProgress from '@/components/NavigationProgress';
import { Suspense } from 'react';
import { AuthProvider } from '@/hooks/useAuth'; 

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export async function generateMetadata(): Promise<Metadata> {
  const currentSiteSettings = await getSiteSettingsAdmin(); 
  
  let metadataBase: URL;
  const providedBaseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const defaultBaseUrl = 'http://localhost:9002'; 

  try {
    if (providedBaseUrl && providedBaseUrl.trim() !== '') {
      metadataBase = new URL(providedBaseUrl);
    } else {
      console.warn(`NEXT_PUBLIC_BASE_URL is not set or is empty. Falling back to '${defaultBaseUrl}' for metadataBase.`);
      metadataBase = new URL(defaultBaseUrl);
    }
  } catch (e) {
    console.error(`Failed to construct URL from NEXT_PUBLIC_BASE_URL ('${providedBaseUrl}'). Falling back to '${defaultBaseUrl}'. Error:`, e);
    metadataBase = new URL(defaultBaseUrl);
  }

  const metadataResult: Metadata = {
    metadataBase,
    title: {
      default: currentSiteSettings.siteTitle || 'SmartAcessorios',
      template: `%s | ${currentSiteSettings.siteTitle || 'SmartAcessorios'}`,
    },
    description: currentSiteSettings.siteDescription || 'Descubra os melhores acessórios para smartphones com links de afiliados e resumos de IA.',
    applicationName: currentSiteSettings.siteTitle || 'SmartAcessorios',
    appleWebApp: {
      capable: true,
      title: currentSiteSettings.siteTitle || 'SmartAcessorios',
      statusBarStyle: 'default',
    },
    openGraph: {
        title: currentSiteSettings.siteTitle,
        description: currentSiteSettings.siteDescription,
        images: currentSiteSettings.siteLogoUrl ? [{ url: currentSiteSettings.siteLogoUrl }] : [],
        url: metadataBase,
        siteName: currentSiteSettings.siteTitle,
    },
    twitter: {
        card: "summary_large_image",
        title: currentSiteSettings.siteTitle,
        description: currentSiteSettings.siteDescription,
        images: currentSiteSettings.siteLogoUrl ? [currentSiteSettings.siteLogoUrl] : [],
    },
  };

  if (currentSiteSettings.siteFaviconUrl && currentSiteSettings.siteFaviconUrl.trim() !== '') {
    metadataResult.icons = {
      icon: currentSiteSettings.siteFaviconUrl,
    };
  } else {
    // If no custom favicon is set, do not include the icons.icon field.
    // This avoids pointing to a potentially non-existent /favicon.ico
    // that might cause "Cannot find module for page: /favicon.ico" during static export.
    // Browsers will still attempt to load /favicon.ico from the root by default if present in public/.
  }
  
  return metadataResult;
}

export async function generateViewport(): Promise<Viewport> {
  // const currentSiteSettings = await getSiteSettingsAdmin(); // Not needed for themeColor
  const themeColorFromSettings = null; 
  return {
    themeColor: themeColorFromSettings || '#3F51B5', 
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  console.log('--- RENDERIZANDO: src/app/layout.tsx no SERVIDOR ---');
  const adminSettings = await getSiteSettingsAdmin();
  const baseSocialLinks = getBaseSocialLinkSettings();

  // Merge admin settings with base social link structure (including icons)
  const mergedSocialLinksFull: SocialLinkSetting[] = baseSocialLinks.map(baseLink => {
    const adminDataForLink = adminSettings.socialLinks.find(as => as.platform === baseLink.platform);
    return {
      ...baseLink, 
      url: adminDataForLink?.url || baseLink.url || "", 
      customImageUrl: adminDataForLink?.customImageUrl || baseLink.customImageUrl || "", 
    };
  });

  // Create a serializable version of social links for client components
  const serializableSocialLinks: SerializableSocialLinkSetting[] = mergedSocialLinksFull.map(link => ({
    platform: link.platform,
    label: link.label,
    url: link.url,
    placeholderUrl: link.placeholderUrl,
    customImageUrl: link.customImageUrl,
    // IconComponent is deliberately omitted here
  }));

  const settingsForClient: SiteSettingsForClient = {
    siteTitle: adminSettings.siteTitle,
    siteDescription: adminSettings.siteDescription,
    siteLogoUrl: adminSettings.siteLogoUrl,
    siteFaviconUrl: adminSettings.siteFaviconUrl,
    socialLinks: serializableSocialLinks, // Pass the serializable links
  };

  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <ClientProviders>
          <Suspense fallback={null}>
            <NavigationProgress />
          </Suspense>
          <Header siteLogoUrl={settingsForClient.siteLogoUrl} siteTitle={settingsForClient.siteTitle} />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer siteSettings={settingsForClient} />
          <Toaster />
        </ClientProviders>
      </body>
    </html>
  );
}
