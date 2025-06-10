
"use client";

import { useState, useEffect } from 'react';
import type { User, Badge as BadgeType } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCircle, Users, UserCheck, Rss, Award, Loader2 } from 'lucide-react';
import FollowButton from '@/components/FollowButton';
import { toggleFollowAction } from '../../actions';
import { AuthProviderClientComponent } from '@/components/AuthProviderClientComponent';
import { getBadgeById } from '@/lib/badges'; 
import { Badge as ShadBadge } from '@/components/ui/badge'; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserListItem from "@/components/UserListItem";
import { getUserById } from '@/lib/data'; // Import getUserById

interface UserProfileClientViewProps {
  profileUser: User;
}

export default function UserProfileClientView({ profileUser }: UserProfileClientViewProps) {
  const initialFollowersCount = profileUser.followers?.length ?? 0;
  const initialFollowingCount = profileUser.following?.length ?? 0;

  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  
  // State for dialogs and lists
  const [followersList, setFollowersList] = useState<User[]>([]);
  const [followingList, setFollowingList] = useState<User[]>([]);
  const [isLoadingFollowLists, setIsLoadingFollowLists] = useState(false);
  const [isFollowersDialogOpen, setIsFollowersDialogOpen] = useState(false);
  const [isFollowingDialogOpen, setIsFollowingDialogOpen] = useState(false);

  const earnedBadges = (profileUser.badges || [])
    .map(badgeId => getBadgeById(badgeId))
    .filter(badge => badge !== undefined) as BadgeType[];

  useEffect(() => {
    // Update followers count if it changes via FollowButton
    if (profileUser.followers) {
      setFollowersCount(profileUser.followers.length);
    }
  }, [profileUser.followers]);
  
  useEffect(() => {
    if (profileUser && (isFollowersDialogOpen || isFollowingDialogOpen)) {
      setIsLoadingFollowLists(true);
      
      const fetchedFollowers = (profileUser.followers || [])
        .map(id => getUserById(id))
        .filter(u => u !== undefined) as User[];

      const fetchedFollowing = (profileUser.following || [])
        .map(id => getUserById(id))
        .filter(u => u !== undefined) as User[];

      setFollowersList(fetchedFollowers);
      setFollowingList(fetchedFollowing);
      setIsLoadingFollowLists(false);
    }
  }, [profileUser, isFollowersDialogOpen, isFollowingDialogOpen]);


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
                <Dialog open={isFollowersDialogOpen} onOpenChange={setIsFollowersDialogOpen}>
                  <DialogTrigger asChild>
                    <button className="text-left hover:opacity-80 transition-opacity">
                      <p className="text-2xl font-bold">{followersCount}</p>
                      <p className="text-sm text-muted-foreground">Seguidores</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Seguidores de {profileUser.name}</DialogTitle>
                      <DialogDescription>
                        Pessoas que seguem {profileUser.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] pr-3 -mr-3">
                      {isLoadingFollowLists ? (
                         <div className="flex justify-center items-center h-full">
                           <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         </div>
                      ) : followersList.length > 0 ? (
                        <div className="space-y-1 py-1">
                          {followersList.map(follower => (
                            <UserListItem key={follower.id} user={follower} onDialogClose={() => setIsFollowersDialogOpen(false)} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-10">Nenhum seguidor ainda.</p>
                      )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                <Dialog open={isFollowingDialogOpen} onOpenChange={setIsFollowingDialogOpen}>
                  <DialogTrigger asChild>
                     <button className="text-left hover:opacity-80 transition-opacity">
                      <p className="text-2xl font-bold">{initialFollowingCount}</p>
                      <p className="text-sm text-muted-foreground">Seguindo</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{profileUser.name} está Seguindo</DialogTitle>
                      <DialogDescription>
                        Pessoas que {profileUser.name} segue.
                      </DialogDescription>
                    </DialogHeader>
                     <ScrollArea className="h-[300px] pr-3 -mr-3">
                       {isLoadingFollowLists ? (
                         <div className="flex justify-center items-center h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                         </div>
                       ) : followingList.length > 0 ? (
                        <div className="space-y-1 py-1">
                          {followingList.map(followedUser => (
                            <UserListItem key={followedUser.id} user={followedUser} onDialogClose={() => setIsFollowingDialogOpen(false)}/>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-10">{profileUser.name} não segue ninguém ainda.</p>
                      )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>

              {isAuthenticated && currentUser && currentUser.id !== profileUser.id && (
                <div className="flex justify-center pt-4">
                  <FollowButton
                    currentUserId={currentUser.id}
                    targetUserId={profileUser.id}
                    initialIsFollowing={currentUser.following?.includes(profileUser.id) ?? false}
                    initialFollowersCount={initialFollowersCount} // Pass initial to FollowButton for its own logic
                    formAction={toggleFollowAction}
                  />
                </div>
              )}

              {earnedBadges.length > 0 && (
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-500"/> Conquistas ({earnedBadges.length})
                  </h3>
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-2">
                        {earnedBadges.map(badge => (
                          <Tooltip key={badge.id}>
                            <TooltipTrigger asChild>
                              <ShadBadge 
                                variant="outline" 
                                className={`cursor-default border-2 p-1.5 text-xs ${badge.color || 'border-primary/50'} hover:opacity-90 flex items-center gap-1`}
                              >
                                <badge.icon className="h-3.5 w-3.5" />
                                {badge.name}
                              </ShadBadge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p className="text-sm font-semibold">{badge.name}</p>
                              <p className="text-xs text-muted-foreground">{badge.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                    </div>
                  </TooltipProvider>
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
