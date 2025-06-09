
"use client"; 

import Link from 'next/link';
import Image from 'next/image';
import { Heart, LogIn, UserPlus, LogOut, Tag, Ticket, ShoppingBag, LayoutDashboard, BookOpenText, UserCircle } from 'lucide-react';
import MobileNav from './MobileNav';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './ui/button';
import logoSrc from '@/img/logo.png';

function AuthDependentLinks() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  return (
    <>
      {isAuthenticated && user && ( // Ensure user object exists
        <>
          <Link href={`/profile/${user.id}`} className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <UserCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
            <span className="sm:hidden">Perfil</span>
          </Link>
          <Link href="/favorites" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Favoritos</span>
            <span className="sm:hidden">Favs</span>
          </Link>
        </>
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
        <>
          {isAdmin && (
             <Link href="/admin/dashboard" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
              <span className="sm:hidden">Admin</span>
            </Link>
          )}
           <Link href="/dashboard" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2" title="Painel de Controle">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Painel</span>
            <span className="sm:hidden sr-only">Painel</span>
          </Link>
          <Button onClick={logout} variant="ghost" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2 text-xs sm:text-sm h-auto">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Sair</span>
          </Button>
        </>
      )}
    </>
  );
}


export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logoSrc}
            alt="SmartAcessorios Logo"
            width={191} 
            height={32}
            priority={true}
            className="h-8 w-auto" 
          />
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
          <Link href="/blog" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80 p-1 sm:p-2">
            <BookOpenText className="h-4 w-4" />
            <span className="hidden sm:inline">Blog</span>
          </Link>
          <AuthDependentLinks />
        </nav>
      </div>
    </header>
  );
}
