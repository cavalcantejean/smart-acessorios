
"use client";

import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';
import { getSiteSettings } from '@/lib/data';
import type { SiteSettings, SocialLinkSetting } from '@/lib/types';
import React, { useEffect, useState } from 'react';

// Importa os ícones PNG locais
import facebookIcon from '@/img/social/facebook.png';
import instagramIcon from '@/img/social/instagram.png';
import twitterIcon from '@/img/social/twitter.png'; // Reinstated
import tiktokIcon from '@/img/social/tiktok.png';
import whatsappIcon from '@/img/social/whatsapp.png';
import pinterestIcon from '@/img/social/pinterest.png';
import telegramIcon from '@/img/social/telegram.png';
import discordIcon from '@/img/social/discord.png';
import snapchatIcon from '@/img/social/snapchat.png';
import threadsIcon from '@/img/social/threads.png';
import emailIcon from '@/img/social/email.png'; // Reinstated
import youtubeIcon from '@/img/social/youtube.png';
import kwaiIcon from '@/img/social/kwai.png';
// Adicione mais importações se tiver mais ícones

// Mapeamento das strings de plataforma para os objetos de imagem importados
const localIconMap: Record<string, StaticImageData | undefined> = {
  Facebook: facebookIcon,
  Instagram: instagramIcon,
  Twitter: twitterIcon, // Mapeado para X (Twitter)
  TikTok: tiktokIcon,
  WhatsApp: whatsappIcon,
  Pinterest: pinterestIcon,
  Telegram: telegramIcon,
  Discord: discordIcon,
  Snapchat: snapchatIcon,
  Threads: threadsIcon,
  Email: emailIcon, // Mapeado para Email
  YouTube: youtubeIcon,
  Kwai: kwaiIcon,
};


export default function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    setSettings(getSiteSettings());
  }, []);

  if (!settings) {
    return (
      <footer className="border-t bg-background/80 text-foreground/70 pt-8 pb-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} SmartAcessorios. Carregando...</p>
        </div>
      </footer>
    );
  }

  const socialLinksToRender = settings.socialLinks.filter(
    link => link.url && link.url.trim() !== ''
  );

  return (
    <footer className="border-t bg-background/80 text-foreground/70 pt-8 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">{settings.siteTitle}</h3>
            <p className="text-sm">
              Sua loja completa para as melhores ofertas de acessórios para smartphones.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Navegação Rápida</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-primary transition-colors">Página Inicial</Link></li>
              <li><Link href="/products" className="hover:text-primary transition-colors">Produtos</Link></li>
              <li><Link href="/deals" className="hover:text-primary transition-colors">Ofertas do Dia</Link></li>
              <li><Link href="/coupons" className="hover:text-primary transition-colors">Cupons</Link></li>
            </ul>
          </div>

          {socialLinksToRender.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Siga-nos</h3>
              <div className="flex flex-wrap gap-4">
                {socialLinksToRender.map((link) => {
                  const { platform, label, url, customImageUrl, IconComponent } = link;
                  let iconContent;

                  const localIconSrc = localIconMap[platform];

                  if (customImageUrl) {
                    iconContent = (
                      <Image
                        src={customImageUrl}
                        alt={`${label} icon`}
                        width={24}
                        height={24}
                        className="h-6 w-6"
                        unoptimized={customImageUrl.startsWith('data:')}
                      />
                    );
                  } else if (localIconSrc) {
                    iconContent = (
                      <Image
                        src={localIconSrc}
                        alt={`${label} icon`}
                        width={24}
                        height={24}
                        className="h-6 w-6"
                      />
                    );
                  } else if (IconComponent) {
                    // Fallback to Lucide icon if local PNG or custom image is not available
                    iconContent = <IconComponent className="h-6 w-6" />;
                  } else {
                    // Fallback text if no icon is available at all
                    iconContent = <span>{label.substring(0,2)}</span>;
                  }

                  return (
                    <Link
                      key={platform}
                      href={url}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/70 hover:text-primary transition-colors"
                      title={label}
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
            &copy; {new Date().getFullYear()} {settings.siteTitle}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
