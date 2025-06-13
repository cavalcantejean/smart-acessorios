
import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import { getSiteSettings } from '@/lib/data';
import type { SiteSettings } from '@/lib/types'; 
import NavigationProgress from '@/components/NavigationProgress';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Removido: const siteSettings: SiteSettings = getSiteSettings(); 
// As configurações serão buscadas dentro das funções/componentes.

export async function generateMetadata(): Promise<Metadata> {
  const currentSiteSettings = getSiteSettings(); // Busca as configurações mais recentes aqui
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  const metadataBase = new URL(baseUrl);

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
  };
}

export async function generateViewport(): Promise<Viewport> { // Renomeado para generateViewport e tornado async
  const currentSiteSettings = getSiteSettings();
  const themeColorFromSettings = currentSiteSettings.socialLinks.find(l => l.platform === 'PrimaryColorHex')?.url;
  return {
    themeColor: themeColorFromSettings || '#3F51B5', 
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentSiteSettings = getSiteSettings(); // Busca as configurações mais recentes aqui

  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <NavigationProgress />
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
