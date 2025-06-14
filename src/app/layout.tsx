
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import { getSiteSettings } from '@/lib/data';
import type { SiteSettings, SiteSettingsForClient } from '@/lib/types'; 
import NavigationProgress from '@/components/NavigationProgress';
import { Suspense } from 'react';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export async function generateMetadata(): Promise<Metadata> {
  const currentSiteSettings = await getSiteSettings();
  
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

  return {
    metadataBase,
    title: {
      default: currentSiteSettings.siteTitle || 'SmartAcessorios',
      template: `%s | ${currentSiteSettings.siteTitle || 'SmartAcessorios'}`,
    },
    description: currentSiteSettings.siteDescription || 'Descubra os melhores acessórios para smartphones com links de afiliados e resumos de IA.',
    icons: {
      icon: currentSiteSettings.siteFaviconUrl || '/favicon.ico',
    },
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
}

export async function generateViewport(): Promise<Viewport> {
  const currentSiteSettings = await getSiteSettings();
  // Se você tiver uma cor de tema nas configurações, pode usá-la aqui.
  // Ex: const themeColorFromSettings = currentSiteSettings.themeColor;
  const themeColorFromSettings = null; 
  return {
    themeColor: themeColorFromSettings || '#3F51B5', // Cor primária como fallback
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentSiteSettings: SiteSettingsForClient = await getSiteSettings();

  // Prepara uma versão serializável de socialLinks para o Footer
  const serializableSocialLinks = currentSiteSettings.socialLinks.map(link => ({
    platform: link.platform,
    label: link.label,
    url: link.url,
    customImageUrl: link.customImageUrl,
    // IconComponent e placeholderUrl são omitidos aqui
  }));

  const settingsForFooter: SiteSettings = {
    siteTitle: currentSiteSettings.siteTitle,
    siteDescription: currentSiteSettings.siteDescription,
    siteLogoUrl: currentSiteSettings.siteLogoUrl,
    siteFaviconUrl: currentSiteSettings.siteFaviconUrl,
    socialLinks: serializableSocialLinks,
  };


  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Suspense fallback={null}> {/* Wrap NavigationProgress with Suspense */}
            <NavigationProgress />
          </Suspense>
          <Header siteLogoUrl={currentSiteSettings.siteLogoUrl} siteTitle={currentSiteSettings.siteTitle} />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer siteSettings={settingsForFooter} />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
