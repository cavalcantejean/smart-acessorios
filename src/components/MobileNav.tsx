
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Package2, List, Heart, LogIn, UserPlus, Shield, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { getUniqueCategories } from '@/lib/data';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function MobileNav() {
  const [categories, setCategories] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setCategories(getUniqueCategories());
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinkClasses = (href: string) => 
    cn("flex items-center justify-between w-full text-left p-3 rounded-md hover:bg-muted transition-colors",
       pathname === href ? "bg-muted font-semibold" : ""
    );
  
  const categoryLinkClasses = (category: string) => {
    const categoryQuery = `/?category=${encodeURIComponent(category)}`;
    return cn("flex items-center justify-between w-full text-left p-3 rounded-md hover:bg-muted transition-colors",
       pathname + (typeof window !== 'undefined' ? window.location.search : '') === categoryQuery ? "bg-muted font-semibold" : ""
    );
  }


  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:text-primary-foreground/80 md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0 flex flex-col bg-card">
        <SheetHeader className="p-4 border-b">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold" onClick={() => setIsOpen(false)}>
            <Package2 className="h-6 w-6 text-primary" />
            <span className="font-headline text-xl text-primary">SmartAccessoryLink</span>
          </Link>
        </SheetHeader>
        <div className="flex-grow overflow-y-auto p-4 space-y-1">
          <Link href="/" className={navLinkClasses("/")} onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2">
              <List className="h-5 w-5" /> Todos Acessórios
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href="/favorites" className={navLinkClasses("/favorites")} onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" /> Favoritos
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          
          {categories.length > 0 && (
            <>
              <Separator className="my-3" />
              <h4 className="text-sm font-medium text-muted-foreground px-3 py-2">Categorias</h4>
              {categories.map(category => (
                <Link 
                  key={category} 
                  href={`/?category=${encodeURIComponent(category)}`} 
                  className={categoryLinkClasses(category)}
                  onClick={() => setIsOpen(false)}
                >
                  {category}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </>
          )}
          <Separator className="my-3" />
           <Link href="/login" className={navLinkClasses("/login")} onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2">
              <LogIn className="h-5 w-5" /> Login
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href="/register" className={navLinkClasses("/register")} onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" /> Cadastrar
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
          <Link href="/admin/login" className={navLinkClasses("/admin/login")} onClick={() => setIsOpen(false)}>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Admin
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
