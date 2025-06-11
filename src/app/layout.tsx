import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import { getSiteSettings } from '@/lib/data';
import NavigationProgress from '@/components/NavigationProgress';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const siteSettings = getSiteSettings();

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
  const metadataBase = new URL(baseUrl);

  return {
    metadataBase,
    title: {
      default: siteSettings.siteTitle || 'SmartAcessorios',
      template: `%s | ${siteSettings.siteTitle || 'SmartAcessorios'}`,
    },
    description: siteSettings.siteDescription || 'Descubra os melhores acessórios para smartphones com links de afiliados e resumos de IA.',
    icons: {
      icon: siteSettings.siteFaviconUrl || '/favicon.ico',
    },
    applicationName: siteSettings.siteTitle || 'SmartAcessorios',
    appleWebApp: {
      capable: true,
      title: siteSettings.siteTitle || 'SmartAcessorios',
      statusBarStyle: 'default',
    },
  };
}

export const viewport: Viewport = {
  themeColor: siteSettings.socialLinks.find(l => l.platform === 'PrimaryColorHex')?.url || '#3F51B5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      {/* A tag <head> explícita foi removida. Next.js a gerenciará. */}
      {/* As fontes do Google (Inter) são carregadas via next/font/google e aplicadas via className na tag html e CSS. */}
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <NavigationProgress />
          <Header siteLogoUrl={siteSettings.siteLogoUrl} />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
