
"use client";

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { User, Heart, Settings, LogOut, Loader2, Award, Lock, ExternalLinkIcon } from 'lucide-react'; // Users, UserCheck REMOVED
import { getUserById } from '@/lib/data';
import type { UserFirestoreData as FullUserType, Badge as BadgeType } from '@/lib/types';
import { allBadges, getBadgeById } from '@/lib/badges';
import { Badge as ShadBadge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Timestamp } from 'firebase/firestore';

// Client-side User type (dates as strings)
interface ClientFullUser extends Omit<FullUserType, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}


export default function DashboardPage() {
  const { user: authUser, isAuthenticated, isLoading: isLoadingAuth, logout } = useAuth();
  const router = useRouter();
  const [fullUser, setFullUser] = useState<ClientFullUser | null>(null);
  const [isLoadingFullUser, setIsLoadingFullUser] = useState(true);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoadingAuth, isAuthenticated, router]);

  useEffect(() => {
    const fetchFullUser = async () => {
      if (authUser && isAuthenticated) {
        setIsLoadingFullUser(true);
        try {
          const fetchedUser = await getUserById(authUser.id);
          if (fetchedUser) {
            const clientReadyUser: ClientFullUser = {
              ...fetchedUser,
              createdAt: fetchedUser.createdAt instanceof Timestamp ? fetchedUser.createdAt.toDate().toISOString() : fetchedUser.createdAt,
              updatedAt: fetchedUser.updatedAt instanceof Timestamp ? fetchedUser.updatedAt.toDate().toISOString() : fetchedUser.updatedAt,
            };
            setFullUser(clientReadyUser);
            setEarnedBadgeIds(clientReadyUser.badges || []);
            document.title = `${clientReadyUser.name} - Painel | SmartAcessorios`;
          }
        } catch (error) {
          console.error("Error fetching full user data:", error);
        } finally {
          setIsLoadingFullUser(false);
        }
      } else if (!isLoadingAuth && !isAuthenticated) {
        setIsLoadingFullUser(false);
      }
    };
    fetchFullUser();
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
          <CardDescription>Seus dados cadastrais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Nome:</strong> {fullUser.name}</p>
              <p><strong>Email:</strong> {fullUser.email}</p>
              <p><strong>Tipo de Conta:</strong> {fullUser.isAdmin ? 'Administrador' : 'Usuário Comum'}</p>
            </div>
            {/* Follower/Following count display REMOVED */}
          </div>
           <Button asChild variant="link" className="p-0 h-auto">
            <Link href={`/profile/${fullUser.id}`}>
              Ver meu perfil público <ExternalLinkIcon className="ml-1 h-3 w-3"/>
            </Link>
          </Button>
        </CardContent>
      </Card>


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            Minhas Conquistas
          </CardTitle>
          <CardDescription>Seus badges e reconhecimentos na plataforma. Interaja para desbloquear todos!</CardDescription>
        </CardHeader>
        <CardContent>
          <TooltipProvider>
            <div className="flex flex-wrap gap-3">
              {allBadges.map(badge => {
                const isEarned = earnedBadgeIds.includes(badge.id);
                return (
                  <Tooltip key={badge.id} delayDuration={100}>
                    <TooltipTrigger asChild>
                      <ShadBadge
                        variant="outline"
                        className={`cursor-default border-2 p-2 text-sm flex items-center gap-1.5 transition-all duration-200 ease-in-out hover:shadow-md
                                    ${isEarned ? `${badge.color || 'border-primary/70 text-foreground'} hover:opacity-90`
                                                : 'border-muted/50 text-muted-foreground opacity-60 hover:opacity-80'}`}
                      >
                        {isEarned ? <badge.icon className="h-4 w-4" /> : <Lock className="h-4 w-4 text-muted-foreground/70" />}
                        <span className={!isEarned ? 'filter grayscale opacity-80' : ''}>{badge.name}</span>
                      </ShadBadge>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-background border shadow-xl rounded-md p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        {isEarned ? <badge.icon className={`h-5 w-5 ${badge.color ? '' : 'text-primary'}`} /> : <Lock className="h-5 w-5 text-muted-foreground" />}
                        <p className="text-base font-semibold">{badge.name}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{badge.description}</p>
                      {!isEarned && (
                        <p className="text-xs text-primary/80 mt-1.5">Continue interagindo para desbloquear!</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
          {allBadges.length === 0 && (
            <p className="text-muted-foreground">Nenhum badge configurado no sistema ainda.</p>
          )}
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
              Configurações
            </CardTitle>
            <CardDescription>Gerencie suas preferências e dados.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/settings">Acessar Configurações</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
