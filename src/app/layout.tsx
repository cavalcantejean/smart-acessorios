
import type { Metadata, Viewport } from 'next'; // Import Viewport
import './globals.css';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/hooks/useAuth';
import { getSiteSettings } from '@/lib/data'; 
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar'; // Import the registrar

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

// Fetch settings once, can be used by both generateMetadata and RootLayout
const siteSettings = getSiteSettings();

export async function generateMetadata(): Promise<Metadata> {
  // Ensure metadataBase is correctly defined. Using a common placeholder if window is not available.
  // For server components, window.location.origin is not available.
  // You might need to set this from an environment variable for production.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002'; // Default to localhost for dev
  const metadataBase = new URL(baseUrl);

  return {
    metadataBase,
    title: {
      default: siteSettings.siteTitle || 'SmartAcessorios',
      template: `%s | ${siteSettings.siteTitle || 'SmartAcessorios'}`,
    },
    description: siteSettings.siteDescription || 'Descubra os melhores acessórios para smartphones com links de afiliados e resumos de IA.',
    manifest: '/manifest.json', // Link to the manifest file
    icons: {
      icon: siteSettings.siteFaviconUrl || '/favicon.ico', 
      apple: [ // Apple touch icons
        { url: '/apple-touch-icon.png', sizes: '180x180' }, // Default apple-touch-icon
        // Add other sizes if you provide them, e.g.:
        // { url: '/apple-touch-icon-152x152.png', sizes: '152x152' },
        // { url: '/apple-touch-icon-120x120.png', sizes: '120x120' },
        // { url: '/apple-touch-icon-76x76.png', sizes: '76x76' },
      ],
    },
    applicationName: siteSettings.siteTitle || 'SmartAcessorios',
    appleWebApp: { // Apple PWA specific settings
      capable: true,
      title: siteSettings.siteTitle || 'SmartAcessorios',
      statusBarStyle: 'default', // or 'black', 'black-translucent'
    },
  };
}

// Add Viewport configuration for PWA theme color
export const viewport: Viewport = {
  themeColor: siteSettings.socialLinks.find(l => l.platform === 'PrimaryColorHex')?.url || '#3F51B5', // Fallback, ideally from settings
  // Example of theme_color from settings if it were stored as { platform: 'ThemeColor', url: '#HEXVAL' }
  // themeColor: siteSettings.socialLinks.find(l => l.platform === 'PrimaryColorHex')?.url || '#3F51B5', 
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // siteSettings is already fetched above
  return (
    <html lang="pt-BR" className={`${inter.variable}`}>
      <head>
        {/* Removed manifest link from here as it's handled by generateMetadata */}
        {/* Theme color is now handled by viewport export */}
        {/* Apple PWA meta tags are now handled by generateMetadata */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen">
        <AuthProvider>
          <Header siteLogoUrl={siteSettings.siteLogoUrl} />
          <main className="flex-grow container mx-auto px-4 py-8">
            {children}
          </main>
          <Footer />
          <Toaster />
          <ServiceWorkerRegistrar /> {/* Add the registrar component here */}
        </AuthProvider>
      </body>
    </html>
  );
}
