
"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Heart, Settings, LogOut, Loader2, Users, UserCheck, ExternalLink } from 'lucide-react';
import { getUserById } from '@/lib/data'; // To fetch full user data if needed
import type { User as FullUserType } from '@/lib/types';


export default function DashboardPage() {
  const { user: authUser, isAuthenticated, isLoading: isLoadingAuth, logout } = useAuth();
  const router = useRouter();
  const [fullUser, setFullUser] = useState<FullUserType | null>(null);
  const [isLoadingFullUser, setIsLoadingFullUser] = useState(true);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  useEffect(() => {
    if (authUser && isAuthenticated) {
      const fetchedUser = getUserById(authUser.id);
      if (fetchedUser) {
        setFullUser(fetchedUser);
      }
      setIsLoadingFullUser(false);
      if (typeof window !== 'undefined') {
        document.title = `${authUser.name} - Painel | SmartAcessorios`;
      }
    } else if (!isLoadingAuth && !isAuthenticated) {
      setIsLoadingFullUser(false); // Not authenticated, no user to load
    }
  }, [authUser, isAuthenticated, isLoadingAuth]);


  if (isLoadingAuth || isLoadingFullUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando dados do usuário...</p>
      </div>
    );
  }

  if (!isAuthenticated || !authUser || !fullUser) {
    // This case should ideally be covered by the redirect, but as a fallback.
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
            <p className="text-muted-foreground">Usuário não encontrado. Redirecionando para login...</p>
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline">Painel de {fullUser.name}</h1>
          <p className="text-muted-foreground">Bem-vindo(a) de volta! Gerencie sua conta aqui.</p>
        </div>
        <Button variant="outline" onClick={() => { logout(); router.push('/'); }} size="sm">
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-6 w-6 text-primary" />
            Informações da Conta
          </CardTitle>
          <CardDescription>Seus dados cadastrais e estatísticas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Nome:</strong> {fullUser.name}</p>
              <p><strong>Email:</strong> {fullUser.email}</p>
              <p><strong>Tipo de Conta:</strong> {fullUser.isAdmin ? 'Administrador' : 'Usuário Comum'}</p>
            </div>
            <div className="text-left md:text-right">
              <p className="flex items-center md:justify-end gap-1 text-sm">
                <Users className="h-4 w-4 text-muted-foreground"/> <strong>Seguidores:</strong> {fullUser.followers?.length ?? 0}
              </p>
              <p className="flex items-center md:justify-end gap-1 text-sm">
                 <UserCheck className="h-4 w-4 text-muted-foreground"/> <strong>Seguindo:</strong> {fullUser.following?.length ?? 0}
              </p>
            </div>
          </div>
           <Button asChild variant="link" className="p-0 h-auto">
            <Link href={`/profile/${fullUser.id}`}>
              Ver meu perfil público <ExternalLink className="ml-1 h-3 w-3"/>
            </Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-destructive" />
              Meus Favoritos
            </CardTitle>
            <CardDescription>Acesse seus acessórios salvos.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/favorites">Ver Favoritos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-muted-foreground" />
              Configurações (Em Breve)
            </CardTitle>
            <CardDescription>Gerencie suas preferências e dados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button disabled className="w-full">
              Acessar Configurações
            </Button>
            <p className="text-xs text-center mt-2 text-muted-foreground">Funcionalidade em desenvolvimento.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
