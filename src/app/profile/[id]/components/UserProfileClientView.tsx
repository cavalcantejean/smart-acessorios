
"use client";

import type { User } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCircle, Users, UserCheck, Rss } from 'lucide-react';
import FollowButton from '@/components/FollowButton';
import { toggleFollowAction } from '../actions'; // Server action
import { AuthProviderClientComponent } from '@/components/AuthProviderClientComponent';

interface UserProfileClientViewProps {
  profileUser: User;
}

export default function UserProfileClientView({ profileUser }: UserProfileClientViewProps) {
  const followersCount = profileUser.followers?.length ?? 0;
  const followingCount = profileUser.following?.length ?? 0;

  return (
    <AuthProviderClientComponent>
      {({ user: currentUser, isAuthenticated }) => (
        <div className="max-w-3xl mx-auto py-8 px-4">
          <Card className="overflow-hidden shadow-xl">
            <CardHeader className="p-6 bg-muted/30 border-b text-center">
              <div className="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-background shadow-lg mb-4">
                {profileUser.avatarUrl ? (
                  <Image
                    src={profileUser.avatarUrl}
                    alt={profileUser.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="128px"
                    priority
                    data-ai-hint={profileUser.avatarHint || "user avatar"}
                  />
                ) : (
                  <div className="w-full h-full bg-secondary flex items-center justify-center">
                    <UserCircle className="h-20 w-20 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardTitle className="text-3xl font-headline">{profileUser.name}</CardTitle>
              {profileUser.isAdmin && (
                <p className="text-sm text-primary font-semibold">Administrador</p>
              )}
              {profileUser.bio && (
                <CardDescription className="mt-2 text-foreground/80 max-w-md mx-auto">{profileUser.bio}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-2xl font-bold">{followersCount}</p>
                  <p className="text-sm text-muted-foreground">Seguidores</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{followingCount}</p>
                  <p className="text-sm text-muted-foreground">Seguindo</p>
                </div>
              </div>

              {isAuthenticated && currentUser && currentUser.id !== profileUser.id && (
                <div className="flex justify-center pt-4">
                  <FollowButton
                    currentUserId={currentUser.id}
                    targetUserId={profileUser.id}
                    initialIsFollowing={currentUser.following?.includes(profileUser.id) ?? false}
                    initialFollowersCount={followersCount}
                    formAction={toggleFollowAction}
                  />
                </div>
              )}
              
              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Rss className="h-5 w-5 text-primary"/> Atividade Recente (Em breve)
                </h3>
                <p className="text-sm text-muted-foreground">
                  Aqui serão exibidos os comentários e curtidas mais recentes de {profileUser.name}.
                </p>
              </div>

            </CardContent>
            <CardFooter className="p-4 bg-secondary/20 border-t">
               <Button variant="outline" size="sm" asChild className="mx-auto">
                  <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Página Inicial
                  </Link>
                </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </AuthProviderClientComponent>
  );
}
