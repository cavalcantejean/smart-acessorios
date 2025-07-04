import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import type { SiteSettingsForClient, SocialLinkSetting } from '@/lib/types'; // Use SiteSettingsForClient
import React from 'react';
import { getBaseSocialLinkSettings } from '@/lib/site-utils';

// Import Lucide icons that will be used as fallbacks or defaults
import {
  Facebook, Instagram, Twitter, Youtube, Mail, HelpCircle,
  MessageSquare, Send, MessageCircle as DiscordIconLucide, Ghost, AtSign, PlaySquare, Film
} from 'lucide-react';
// Import your custom PinterestIcon if it's an SVG component
import PinterestIcon from '@/components/icons/PinterestIcon';

// Import the local PNG icon assets
import facebookIconPng from '@/img/social/facebook.png';
import instagramIconPng from '@/img/social/instagram.png';
import twitterIconPng from '@/img/social/twitter.png';
import tiktokIconPng from '@/img/social/tiktok.png';
import whatsappIconPng from '@/img/social/whatsapp.png';
import pinterestIconPng from '@/img/social/pinterest.png';
import telegramIconPng from '@/img/social/telegram.png';
import discordIconPng from '@/img/social/discord.png';
import snapchatIconPng from '@/img/social/snapchat.png';
import threadsIconPng from '@/img/social/threads.png';
import emailIconPng from '@/img/social/email.png';
import youtubeIconPng from '@/img/social/youtube.png';
import kwaiIconPng from '@/img/social/kwai.png';

// Map platform names to local PNG image data
const localIconMap: Record<string, StaticImageData | undefined> = {
  Facebook: facebookIconPng,
  Instagram: instagramIconPng,
  Twitter: twitterIconPng,
  TikTok: tiktokIconPng,
  WhatsApp: whatsappIconPng,
  Pinterest: pinterestIconPng,
  Telegram: telegramIconPng,
  Discord: discordIconPng,
  Snapchat: snapchatIconPng,
  Threads: threadsIconPng,
  Email: emailIconPng,
  YouTube: youtubeIconPng,
  Kwai: kwaiIconPng,
};

interface FooterProps {
  siteSettings: SiteSettingsForClient | null; // Use SiteSettingsForClient
}

export default function Footer({ siteSettings }: FooterProps) {
  if (!siteSettings) {
    return (
      <footer className="border-t bg-background/80 text-foreground/70 pt-8 pb-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} SmartAcessorios. Carregando...</p>
        </div>
      </footer>
    );
  }

  const baseLinksWithIcons = getBaseSocialLinkSettings();

  // siteSettings.socialLinks are now SerializableSocialLinkSetting (no IconComponent)
  // We map them to include IconComponent for rendering by looking it up from baseLinksWithIcons
  const socialLinksToRender = siteSettings.socialLinks
    .filter(propLink => propLink.url && propLink.url.trim() !== '')
    .map(propLink => {
      const baseLink = baseLinksWithIcons.find(b => b.platform === propLink.platform);
      return {
        platform: propLink.platform,
        label: propLink.label,
        url: propLink.url,
        customImageUrl: propLink.customImageUrl,
        IconComponent: baseLink?.IconComponent, // Get IconComponent from baseLink
        placeholderUrl: baseLink?.placeholderUrl || '', 
      };
    });


  // Helper function within Footer to get the correct icon
  const getIconForPlatform = (link: typeof socialLinksToRender[0]) => {
    const iconSizeClass = "h-6 w-6";

    if (link.customImageUrl) {
      return <Image src={link.customImageUrl} alt={`${link.platform} icon`} width={24} height={24} className={iconSizeClass} unoptimized={link.customImageUrl.startsWith('data:')}/>;
    }

    const localPng = localIconMap[link.platform];
    if (localPng) {
      return <Image src={localPng} alt={`${link.platform} icon`} width={24} height={24} className={iconSizeClass} />;
    }
    
    if (link.IconComponent) { // IconComponent is now correctly sourced from baseLinksWithIcons
        return <link.IconComponent className={iconSizeClass} />;
    }

    switch (link.platform) {
      case "Facebook": return <Facebook className={iconSizeClass} />;
      case "Instagram": return <Instagram className={iconSizeClass} />;
      case "Twitter": return <Twitter className={iconSizeClass} />;
      case "TikTok": return <Film className={iconSizeClass} />;
      case "WhatsApp": return <MessageSquare className={iconSizeClass} />;
      case "Pinterest": return <PinterestIcon className={iconSizeClass} />;
      case "Telegram": return <Send className={iconSizeClass} />;
      case "Discord": return <DiscordIconLucide className={iconSizeClass} />;
      case "Snapchat": return <Ghost className={iconSizeClass} />;
      case "Threads": return <AtSign className={iconSizeClass} />;
      case "Email": return <Mail className={iconSizeClass} />;
      case "YouTube": return <Youtube className={iconSizeClass} />;
      case "Kwai": return <PlaySquare className={iconSizeClass} />;
      default: return <HelpCircle className={iconSizeClass} />;
    }
  };

  return (
    <footer className="border-t bg-background/80 text-foreground/70 pt-8 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{siteSettings.siteTitle}</h3>
            <p className="text-sm">
              {siteSettings.siteDescription}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Navegação Rápida</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Página Inicial</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Produtos</Link></li>
              <li><Link href="/deals" className="hover:text-primary transition-colors">Ofertas do Dia</Link></li>
              <li><Link href="/coupons" className="hover:text-primary transition-colors">Cupons</Link></li>
              <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
            </ul>
          </div>

          {socialLinksToRender.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Siga-nos</h3>
              <div className="flex flex-wrap gap-4">
                {socialLinksToRender.map((link) => {
                  const iconContent = getIconForPlatform(link);
                  return (
                    <Link
                      key={link.platform}
                      href={link.url}
                      aria-label={link.label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/70 hover:text-primary transition-colors"
                      title={link.label}
                    >
                      {iconContent}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-foreground/20 pt-6 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} {siteSettings.siteTitle}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
