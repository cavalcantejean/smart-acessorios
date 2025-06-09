
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, ShoppingBag, Heart, LogIn, UserPlus, LayoutDashboard, ChevronRight, LogOut, Tag, Ticket, BookOpenText, UserCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { getUniqueCategories } from '@/lib/data';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import logoSrc from '@/img/logo.png';

export default function MobileNav() {
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout, isLoading: isLoadingAuth } = useAuth();

  useEffect(() => {
    setCategories(getUniqueCategories());
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Close sheet on navigation
      // setIsOpen(false); // This was causing issues, handled by handleLinkClick
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // Constructing the category path for comparison.
    // This assumes products page displays categories as query params.
    // Adjust if your routing for categories is different (e.g., /products/category-name)
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
              src={logoSrc} 
              alt="SmartAcessorios Logo"
              width={239} 
              height={40} 
              priority={true}
              className="h-10 w-auto" 
            />
          </Link>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto p-4 space-y-1">
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

          {isAuthenticated && (
            <>
              <Separator className="my-3" />
              <Link href="/dashboard" className={navLinkClasses("/dashboard")} onClick={handleLinkClick}>
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" /> Painel ({user?.name.split(' ')[0]})
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
                  // Ensure this link structure matches how categories are handled on the products page
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
              <button onClick={handleLogoutClick} className={navLinkClasses("/logout-action")}>
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
