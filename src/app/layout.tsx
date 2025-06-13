
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import { getSiteSettings } from '@/lib/data'; // Now async
import type { SiteSettings } from '@/lib/types'; 
import NavigationProgress from '@/components/NavigationProgress';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export async function generateMetadata(): Promise<Metadata> {
  const currentSiteSettings = await getSiteSettings(); // Fetch latest settings
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'; // Ensure your env var is set
  const metadataBase = new URL(baseUrl);

  return {
    metadataBase,
    title: {
      default: currentSiteSettings.siteTitle || 'SmartAcessorios',
      template: `%s | ${currentSiteSettings.siteTitle || 'SmartAcessorios'}`,
    },
    description: currentSiteSettings.siteDescription || 'Descubra os melhores acessórios para smartphones com links de afiliados e resumos de IA.',
    icons: {
      icon: currentSiteSettings.siteFaviconUrl || '/favicon.ico', // Use dynamic favicon
    },
    applicationName: currentSiteSettings.siteTitle || 'SmartAcessorios',
    appleWebApp: {
      capable: true,
      title: currentSiteSettings.siteTitle || 'SmartAcessorios',
      statusBarStyle: 'default',
    },
    // Open Graph and Twitter card metadata can also use currentSiteSettings
    openGraph: {
        title: currentSiteSettings.siteTitle,
        description: currentSiteSettings.siteDescription,
        images: currentSiteSettings.siteLogoUrl ? [{ url: currentSiteSettings.siteLogoUrl }] : [],
        url: metadataBase, // Base URL of the site
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
  const currentSiteSettings = await getSiteSettings(); // Fetch latest settings
  // Example: if you store a theme color HEX in socialLinks or a dedicated field
  // For now, using a default or a hardcoded one from your CSS if not dynamically set
  // const themeColorFromSettings = currentSiteSettings.socialLinks.find(l => l.platform === 'ThemeColorHex')?.url; 
  const themeColorFromSettings = null; // Placeholder
  return {
    themeColor: themeColorFromSettings || '#3F51B5', // Fallback to your primary theme color
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentSiteSettings = await getSiteSettings(); // Fetch latest settings

  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <NavigationProgress />
          {/* Pass fetched settings to Header and Footer */}
          <Header siteLogoUrl={currentSiteSettings.siteLogoUrl} siteTitle={currentSiteSettings.siteTitle} />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer siteSettings={currentSiteSettings} />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
