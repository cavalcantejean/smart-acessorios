
import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
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
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook" className="text-foreground/70 hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" aria-label="Instagram" className="text-foreground/70 hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
              </Link>
              <Link href="#" aria-label="Twitter" className="text-foreground/70 hover:text-primary transition-colors">
                <Twitter className="h-6 w-6" />
              </Link>
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
