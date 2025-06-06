
import Link from 'next/link';
import { Package2, Heart, List, LogIn, UserPlus, Shield } from 'lucide-react';
import MobileNav from './MobileNav';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Package2 className="h-6 w-6" />
          <span className="font-headline text-xl">SmartAccessoryLink</span>
        </Link>
        
        {/* Mobile Navigation Trigger */}
        <div className="md:hidden">
          <MobileNav />
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 text-xs sm:text-sm lg:gap-4">
          <Link href="/" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Acessórios</span>
            <span className="sm:hidden">Todos</span>
          </Link>
          <Link href="/favorites" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Favoritos</span>
             <span className="sm:hidden">Favs</span>
          </Link>
          <Link href="/login" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <LogIn className="h-4 w-4" />
            Login
          </Link>
          <Link href="/register" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Cadastrar</span>
            <span className="sm:hidden">SignUp</span>
          </Link>
          <Link href="/admin/login" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
