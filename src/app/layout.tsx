
import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import { getSiteSettings } from '@/lib/data'; 

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSiteSettings();
  const metadataBase = typeof window !== 'undefined' ? new URL(window.location.origin) : undefined;

  return {
    metadataBase,
    title: {
      default: settings.siteTitle || 'SmartAcessorios',
      template: `%s | ${settings.siteTitle || 'SmartAcessorios'}`,
    },
    description: settings.siteDescription || 'Descubra os melhores acessórios para smartphones com links de afiliados e resumos de IA.',
    icons: {
      icon: settings.siteFaviconUrl || '/favicon.ico', // Default fallback, Next.js might generate one if not present
      // You can add other icon types here like apple-touch-icon if needed
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = getSiteSettings(); // Fetch settings once for the layout

  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Favicon is now handled by generateMetadata, but can be explicitly set too if needed */}
        {/* {settings.siteFaviconUrl && <link rel="icon" href={settings.siteFaviconUrl} />} */}
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Header siteLogoUrl={settings.siteLogoUrl} />
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
