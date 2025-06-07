
"use client"; // Add this directive

import Link from 'next/link';
import { Package2, Heart, LogIn, UserPlus, Shield, LogOut, Tag, Ticket, ShoppingBag } from 'lucide-react';
import MobileNav from './MobileNav';
import { useAuth } from '@/hooks/useAuth'; // Importar useAuth
import { Button } from './ui/button'; // Para o botão de Logout

// Componente client-side wrapper para usar o hook useAuth
function AuthDependentLinks() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <>
      {isAuthenticated && (
        <Link href="/favorites" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Favoritos</span>
          <span className="sm:hidden">Favs</span>
        </Link>
      )}
      {!isAuthenticated ? (
        <>
          <Link href="/login" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <LogIn className="h-4 w-4" />
            Login
          </Link>
          <Link href="/register" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Cadastrar</span>
            <span className="sm:hidden">Criar Conta</span>
          </Link>
        </>
      ) : (
        <Button onClick={logout} variant="ghost" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2 text-xs sm:text-sm h-auto">
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
           <span className="sm:hidden">Sair</span>
        </Button>
      )}
      <Link href="/admin/login" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
        <Shield className="h-4 w-4" />
        Admin
      </Link>
    </>
  );
}


export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Package2 className="h-6 w-6" />
          <span className="font-headline text-xl">SmartAcessorios</span>
        </Link>
        
        <div className="md:hidden">
          <MobileNav />
        </div>

        <nav className="hidden md:flex items-center gap-2 text-xs sm:text-sm lg:gap-4">
          <Link href="/products" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Produtos</span>
            <span className="sm:hidden">Todos</span>
          </Link>
          <Link href="/deals" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Ofertas</span>
          </Link>
          <Link href="/coupons" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <Ticket className="h-4 w-4" />
            <span className="hidden sm:inline">Cupons</span>
          </Link>
          <AuthDependentLinks />
        </nav>
      </div>
    </header>
  );
}
