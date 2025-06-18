import type { SiteSettings, SocialLinkSetting, Testimonial } from '@/lib/types';
import type { ComponentType } from 'react'; // Added explicitly, though SocialLinkSetting might bring it
import {
  Facebook, Instagram, Twitter, Youtube, Mail,
  MessageSquare, Send, MessageCircle as DiscordIconLucide, Ghost, AtSign, PlaySquare, Film
} from 'lucide-react';
import PinterestIcon from '@/components/icons/PinterestIcon';

// --- Default Site Settings Structure (for storage) ---
const defaultSocialLinksDataForStorage: Array<Omit<SocialLinkSetting, 'IconComponent' | 'placeholderUrl'>> = [
    { platform: "Facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61575978087535", customImageUrl: "" },
    { platform: "Instagram", label: "Instagram", url: "https://www.instagram.com/smart.acessorios", customImageUrl: "" },
    { platform: "Twitter", label: "X (Twitter)", url: "https://x.com/Smart_acessorio", customImageUrl: "" },
    { platform: "TikTok", label: "TikTok", url: "https://tiktok.com/@smartacessorio", customImageUrl: "" },
    { platform: "WhatsApp", label: "WhatsApp", url: "https://whatsapp.com/channel/0029VbAKxmx5PO18KEZQkJ2V", customImageUrl: "" },
    { platform: "Pinterest", label: "Pinterest", url: "https://pinterest.com/smartacessorios", customImageUrl: "" },
    { platform: "Telegram", label: "Telegram", url: "https://t.me/smartacessorios", customImageUrl: "" },
    { platform: "Discord", label: "Discord", url: "https://discord.gg/89bwDJWh3y", customImageUrl: "" },
    { platform: "Snapchat", label: "Snapchat", url: "https://snapchat.com/add/smartacessorios", customImageUrl: "" },
    { platform: "Threads", label: "Threads", url: "https://threads.net/@smart.acessorios", customImageUrl: "" },
    { platform: "Email", label: "Email", url: "mailto:smartacessori@gmail.com", customImageUrl: "" },
    { platform: "YouTube", label: "YouTube", url: "https://youtube.com/@smart.acessorios", customImageUrl: "" },
    { platform: "Kwai", label: "Kwai", url: "https://k.kwai.com/u/@SmartAcessorios", customImageUrl: "" }
];

export const defaultSiteSettings: SiteSettings = {
  siteTitle: 'SmartAcessorios',
  siteDescription: 'Descubra os melhores acessórios para smartphones com links de afiliados e resumos de IA.',
  siteLogoUrl: '',
  siteFaviconUrl: '',
  socialLinks: defaultSocialLinksDataForStorage,
};

export function getBaseSocialLinkSettings(): SocialLinkSetting[] {
  return [
    { platform: "Facebook", label: "Facebook", url: "https://www.facebook.com/profile.php?id=61575978087535", placeholderUrl: "https://facebook.com/seu_usuario", IconComponent: Facebook, customImageUrl: "" },
    { platform: "Instagram", label: "Instagram", url: "https://www.instagram.com/smart.acessorios", placeholderUrl: "https://instagram.com/seu_usuario", IconComponent: Instagram, customImageUrl: "" },
    { platform: "Twitter", label: "X (Twitter)", url: "https://x.com/Smart_acessorio", placeholderUrl: "https://x.com/seu_usuario", IconComponent: Twitter, customImageUrl: "" },
    { platform: "TikTok", label: "TikTok", url: "https://tiktok.com/@smartacessorio", placeholderUrl: "https://tiktok.com/@seu_usuario", IconComponent: Film, customImageUrl: "" },
    { platform: "WhatsApp", label: "WhatsApp", url: "https://whatsapp.com/channel/0029VbAKxmx5PO18KEZQkJ2V", placeholderUrl: "https://wa.me/seu_numero_ou_link_canal", IconComponent: MessageSquare, customImageUrl: "" },
    { platform: "Pinterest", label: "Pinterest", url: "https://pinterest.com/smartacessorios", placeholderUrl: "https://pinterest.com/seu_usuario", IconComponent: PinterestIcon, customImageUrl: "" },
    { platform: "Telegram", label: "Telegram", url: "https://t.me/smartacessorios", placeholderUrl: "https://t.me/seu_canal", IconComponent: Send, customImageUrl: "" },
    { platform: "Discord", label: "Discord", url: "https://discord.gg/89bwDJWh3y", placeholderUrl: "https://discord.gg/seu_servidor", IconComponent: DiscordIconLucide, customImageUrl: "" },
    { platform: "Snapchat", label: "Snapchat", url: "https://snapchat.com/add/smartacessorios", placeholderUrl: "https://snapchat.com/add/seu_usuario", IconComponent: Ghost, customImageUrl: "" },
    { platform: "Threads", label: "Threads", url: "https://threads.net/@smart.acessorios", placeholderUrl: "https://threads.net/@seu_usuario", IconComponent: AtSign, customImageUrl: "" },
    { platform: "Email", label: "Email", url: "mailto:smartacessori@gmail.com", placeholderUrl: "mailto:seu_email@example.com", IconComponent: Mail, customImageUrl: "" },
    { platform: "YouTube", label: "YouTube", url: "https://youtube.com/@smart.acessorios", placeholderUrl: "https://youtube.com/@seu_canal", IconComponent: Youtube, customImageUrl: "" },
    { platform: "Kwai", label: "Kwai", url: "https://k.kwai.com/u/@SmartAcessorios", placeholderUrl: "https://k.kwai.com/u/@seu_usuario", IconComponent: PlaySquare, customImageUrl: "" }
  ];
}

// --- Testimonials (Local/Mock) ---
const testimonials: Testimonial[] = [
  { id: 'testimonial1', name: 'Ana Silva', quote: 'Encontrei os melhores acessórios aqui! A seleção de ofertas do dia é incrível e os resumos de IA me ajudam a decidir rapidamente. Recomendo!', role: 'Cliente Satisfeita', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'woman portrait' },
  { id: 'testimonial2', name: 'Carlos Pereira', quote: 'Os cupons promocionais são ótimos! Consegui um bom desconto na minha última compra de fones de ouvido. O site é fácil de navegar.', role: 'Entusiasta de Gadgets', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'man portrait' },
  { id: 'testimonial3', name: 'Juliana Costa', quote: 'Adoro a variedade de produtos e a clareza das descrições. A funcionalidade de favoritar é muito útil para salvar itens que quero comprar depois.', role: 'Compradora Online', avatarUrl: 'https://placehold.co/100x100.png', avatarHint: 'person smiling' }
];
export function getTestimonials(): Testimonial[] { return testimonials; }
