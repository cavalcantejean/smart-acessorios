
import Link from 'next/link';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Film, 
  MessageSquare, 
  // Pinterest, // Removed as per error
  Send, 
  MessageCircle, 
  Ghost, 
  AtSign, 
  Mail, 
  Youtube,
  PlaySquare
} from 'lucide-react';

// Inline SVG for Pinterest Icon
const PinterestIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className || "h-6 w-6"}
    aria-hidden="true"
  >
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.426 7.627 11.174-.105-.949-.198-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.377-.752-.377-1.845c0-1.713 1.002-2.997 2.249-2.997.962 0 1.437.724 1.437 1.593 0 .968-.623 2.417-.949 3.737-.278 1.113.565 2.035 1.655 2.035 1.988 0 3.492-2.497 3.492-5.246 0-2.765-2.058-4.777-5.046-4.777-3.415 0-5.416 2.545-5.416 5.002 0 .978.346 1.664.746 2.131.068.08.079.16.056.282-.078.386-.268.962-.335 1.227-.086.335-.192.403-.402.312-1.595-.502-2.51-2.215-2.51-4.035 0-3.456 2.417-7.482 7.621-7.482 4.063 0 7.061 2.867 7.061 6.633 0 4.079-2.597 7.156-6.244 7.156-1.202 0-2.356-.631-2.753-1.378l-.749 2.848c-.269 1.045-.995 2.457-1.492 3.258.213.068.436.105.67.105C18.633 24 24 18.633 24 12.017 24 5.396 18.633 0 12.017 0z"/>
  </svg>
);


export default function Footer() {
  const socialLinks = [
    { href: "https://www.facebook.com/profile.php?id=61575978087535", label: "Facebook", Icon: Facebook },
    { href: "https://www.instagram.com/smart.acessorios", label: "Instagram", Icon: Instagram },
    { href: "https://x.com/Smart_acessorio", label: "X (Twitter)", Icon: Twitter },
    { href: "https://tiktok.com/@smartacessorio", label: "TikTok", Icon: Film },
    { href: "https://whatsapp.com/channel/0029VbAKxmx5PO18KEZQkJ2V", label: "WhatsApp", Icon: MessageSquare },
    { href: "https://pinterest.com/smartacessorios", label: "Pinterest", Icon: PinterestIcon }, // Using the inline SVG component
    { href: "https://t.me/smartacessorios", label: "Telegram", Icon: Send },
    { href: "https://discord.gg/89bwDJWh3y", label: "Discord", Icon: MessageCircle },
    { href: "https://snapchat.com/add/smartacessorios", label: "Snapchat", Icon: Ghost },
    { href: "https://threads.net/@smart.acessorios", label: "Threads", Icon: AtSign },
    { href: "mailto:smartacessori@gmail.com", label: "Email", Icon: Mail },
    { href: "https://youtube.com/@smart.acessorios", label: "YouTube", Icon: Youtube },
    { href: "https://k.kwai.com/u/@SmartAcessorios", label: "Kwai", Icon: PlaySquare }
  ];

  return (
    <footer className="border-t bg-background/80 text-foreground/70 pt-8 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About Section/Site Name */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">SmartAcessorios</h3>
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
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Siga-nos</h3>
            <div className="flex flex-wrap gap-4">
              {socialLinks.map(({ href, label, Icon }) => (
                <Link 
                  key={label} 
                  href={href} 
                  aria-label={label} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-foreground/70 hover:text-primary transition-colors"
                >
                  <Icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-foreground/20 pt-6 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} SmartAcessorios. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
