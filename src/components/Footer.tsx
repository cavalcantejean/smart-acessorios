
"use client"; 

import Link from 'next/link';
import Image from 'next/image';
import { getSiteSettings } from '@/lib/data';
import type { SiteSettings } from '@/lib/types';
import React, { useEffect, useState } from 'react';

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
                {socialLinksToRender.map(({ platform, label, url, customImageUrl }) => {
                  const imageSrc = customImageUrl 
                                   ? customImageUrl 
                                   : `/img/social/${platform.toLowerCase()}.png`;
                  
                  return (
                    <Link
                      key={platform}
                      href={url}
                      aria-label={label}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground/70 hover:text-primary transition-colors"
                    >
                      <Image 
                        src={imageSrc} 
                        alt={`${label} icon`} 
                        width={24} 
                        height={24} 
                        className="h-6 w-6" // Mantém o tamanho consistente
                        unoptimized={customImageUrl && customImageUrl.startsWith('data:') ? true : undefined} // Evita otimização para data URIs
                      />
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
