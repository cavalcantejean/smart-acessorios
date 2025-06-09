
import Link from 'next/link';
import { getSiteSettings, getBaseSocialLinkSettings } from '@/lib/data'; // Import site settings
import type { SocialLinkSetting } from '@/lib/types';

export default function Footer() {
  // Fetch social links from site settings.
  // We use getBaseSocialLinkSettings because it guarantees all IconComponents are present.
  // Then we merge the URLs from the current siteSettings.
  const baseSocialLinks = getBaseSocialLinkSettings();
  const currentSiteSettings = getSiteSettings();

  const socialLinksToRender: SocialLinkSetting[] = baseSocialLinks.map(baseLink => {
    const currentLinkData = currentSiteSettings.socialLinks.find(sl => sl.platform === baseLink.platform);
    return {
      ...baseLink,
      url: currentLinkData?.url || baseLink.url, // Use saved URL or default from base if saved is empty
    };
  }).filter(link => link.url && link.url.trim() !== ''); // Only render links that have a URL

  return (
    <footer className="border-t bg-background/80 text-foreground/70 pt-8 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section/Site Name */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{currentSiteSettings.siteTitle}</h3>
            <p className="text-sm">
              Sua loja completa para as melhores ofertas de acessórios para smartphones.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Navegação Rápida</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Página Inicial</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Produtos</Link></li>
              <li><Link href="/deals" className="hover:text-primary transition-colors">Ofertas do Dia</Link></li>
              <li><Link href="/coupons" className="hover:text-primary transition-colors">Cupons</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          {socialLinksToRender.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Siga-nos</h3>
              <div className="flex flex-wrap gap-4">
                {socialLinksToRender.map(({ platform, label, url, IconComponent }) => (
                  <Link 
                    key={platform} 
                    href={url} 
                    aria-label={label} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-foreground/70 hover:text-primary transition-colors"
                  >
                    {IconComponent && <IconComponent className="h-6 w-6" />}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-foreground/20 pt-6 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} {currentSiteSettings.siteTitle}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
