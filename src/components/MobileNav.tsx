
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, ShoppingBag, Heart, LogIn, UserPlus, LayoutDashboard, ChevronRight, LogOut, Tag, Ticket, BookOpenText, UserCircle, Home } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getUniqueCategories, getSiteSettings } from '@/lib/data';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import logoSrc from '@/img/logo.png'; // Fallback static logo

interface MobileNavProps {
  siteLogoUrl?: string;
}

export default function MobileNav({ siteLogoUrl }: MobileNavProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout, isLoading: isLoadingAuth } = useAuth();
  const siteSettings = getSiteSettings();

  const currentLogoSrc = siteLogoUrl && siteLogoUrl.startsWith('data:image') ? siteLogoUrl : logoSrc;
  const logoAltText = siteSettings.siteTitle ? `${siteSettings.siteTitle} Logo` : "SmartAcessorios Logo";


  useEffect(() => {
    setCategories(getUniqueCategories());
  }, []);

  useEffect(() => {
    // No need to close on pathname change if links handle it
  }, [pathname]);

  const handleLinkClick = () => setIsOpen(false);
  const handleLogoutClick = () => {
    logout();
    setIsOpen(false);
  }

  const navLinkClasses = (href: string) => 
    cn("flex items-center justify-between w-full text-left p-3 rounded-md hover:bg-muted transition-colors",
       pathname === href ? "bg-muted font-semibold" : ""
    );
  
  const categoryLinkClasses = (category: string) => {
    const categoryPath = `/products?category=${encodeURIComponent(category)}`;
    let currentPathWithQuery = pathname;
    if (typeof window !== 'undefined') {
      currentPathWithQuery += window.location.search;
    }
    
    return cn("flex items-center justify-between w-full text-left p-3 rounded-md hover:bg-muted transition-colors",
       currentPathWithQuery === categoryPath ? "bg-muted font-semibold" : ""
    );
  }

  if (isLoadingAuth) {
      return  <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-primary-foreground/80 md:hidden animate-pulse">
                <Menu className="h-6 w-6" />
              </Button>;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-primary-foreground/80 md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col bg-card">
        <SheetHeader className="p-4 border-b">
          <Link href="/" className="flex items-center" onClick={handleLinkClick}>
            <Image
              src={currentLogoSrc} 
              alt={logoAltText}
              width={120}
              height={30}
              priority={true}
              className="h-10 w-auto"
              style={{maxHeight: '40px', objectFit: 'contain', width: 'auto'}}
            />
          </Link>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto p-4 space-y-1 text-sm">
          <Link href="/" className={navLinkClasses("/")} onClick={handleLinkClick}>
            <div className="flex items-center gap-2">
              <Home className="h-5 w-5" /> Página Inicial
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href="/products" className={navLinkClasses("/products")} onClick={handleLinkClick}>
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" /> Todos os Produtos
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href="/deals" className={navLinkClasses("/deals")} onClick={handleLinkClick}>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5" /> Ofertas do Dia
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href="/coupons" className={navLinkClasses("/coupons")} onClick={handleLinkClick}>
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5" /> Cupons Promocionais
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href="/blog" className={navLinkClasses("/blog")} onClick={handleLinkClick}>
            <div className="flex items-center gap-2">
              <BookOpenText className="h-5 w-5" /> Blog
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          {isAuthenticated && user && (
            <>
              <Separator className="my-3" />
              <Link href={`/profile/${user.id}`} className={navLinkClasses(`/profile/${user.id}`)} onClick={handleLinkClick}>
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" /> Meu Perfil ({user.name.split(' ')[0]})
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
               <Link href="/dashboard" className={navLinkClasses("/dashboard")} onClick={handleLinkClick}>
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5" /> Painel de Controle
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link href="/favorites" className={navLinkClasses("/favorites")} onClick={handleLinkClick}>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5" /> Favoritos
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </>
          )}
          
          {categories.length > 0 && (
            <>
              <Separator className="my-3" />
              <h4 className="text-sm font-medium text-muted-foreground px-3 py-2">Categorias</h4>
              {categories.map(category => (
                <Link 
                  key={category} 
                  href={`/products?category=${encodeURIComponent(category)}`}
                  className={categoryLinkClasses(category)}
                  onClick={handleLinkClick}
                >
                  {category}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </>
          )}
          <Separator className="my-3" />
          {!isAuthenticated ? (
            <>
              <Link href="/login" className={navLinkClasses("/login")} onClick={handleLinkClick}>
                <div className="flex items-center gap-2">
                  <LogIn className="h-5 w-5" /> Login
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link href="/register" className={navLinkClasses("/register")} onClick={handleLinkClick}>
                <div className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5" /> Cadastrar
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </>
          ) : (
            <>
              {isAdmin && (
                <Link href="/admin/dashboard" className={navLinkClasses("/admin/dashboard")} onClick={handleLinkClick}>
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="h-5 w-5" /> Admin Dashboard
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )}
              <button onClick={handleLogoutClick} className={cn(navLinkClasses("/logout-action"), "w-full")}>
                <div className="flex items-center gap-2">
                  <LogOut className="h-5 w-5" /> Logout
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

    