
"use client";

import { useState, useEffect } from 'react';
import type { UserFirestoreData as User, Badge as BadgeType, Accessory } from '@/lib/types'; // Comment types removed
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCircle, Users, UserCheck, Award, Loader2, ExternalLinkIcon } from 'lucide-react'; // MessageSquare, ThumbsUp removed
import FollowButton from '@/components/FollowButton';
import { toggleFollowAction } from '../../actions';
import { AuthProviderClientComponent } from '@/components/AuthProviderClientComponent';
import { getBadgeById } from '@/lib/badges';
import { Badge as ShadBadge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserListItem from "@/components/UserListItem";
import { getUserById } from '@/lib/data'; // getCommentsByUserId, getAccessoriesLikedByUser removed
import { Separator } from '@/components/ui/separator';
import { Timestamp } from 'firebase/firestore';

interface ClientUser extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}
// ClientAccessory type removed as it's no longer fetched directly here for liked items list

interface UserProfileClientViewProps {
  profileUser: ClientUser;
}

export default function UserProfileClientView({ profileUser: initialProfileUser }: UserProfileClientViewProps) {
  const [profileUser, setProfileUser] = useState<ClientUser>(initialProfileUser);
  const [followersCount, setFollowersCount] = useState(initialProfileUser.followers?.length ?? 0);
  const [followingCount, setFollowingCount] = useState(initialProfileUser.following?.length ?? 0);

  const [followersList, setFollowersList] = useState<ClientUser[]>([]);
  const [followingList, setFollowingList] = useState<ClientUser[]>([]);
  const [isLoadingFollowLists, setIsLoadingFollowLists] = useState(false);
  const [isFollowersDialogOpen, setIsFollowersDialogOpen] = useState(false);
  const [isFollowingDialogOpen, setIsFollowingDialogOpen] = useState(false);

  // recentComments, likedAccessories, isLoadingActivity states REMOVED

  const earnedBadges = (profileUser.badges || [])
    .map(badgeId => getBadgeById(badgeId))
    .filter(badge => badge !== undefined) as BadgeType[];

  const prepareUserForClient = (user: User): ClientUser => ({
    ...user,
    createdAt: user.createdAt instanceof Timestamp ? user.createdAt.toDate().toISOString() : user.createdAt as any,
    updatedAt: user.updatedAt instanceof Timestamp ? user.updatedAt.toDate().toISOString() : user.updatedAt as any,
  });

  useEffect(() => {
    setProfileUser(initialProfileUser);
    setFollowersCount(initialProfileUser.followers?.length ?? 0);
    setFollowingCount(initialProfileUser.following?.length ?? 0);
  }, [initialProfileUser]);

  useEffect(() => {
    const fetchFollowLists = async () => {
      if (!profileUser || !(isFollowersDialogOpen || isFollowingDialogOpen)) return;
      setIsLoadingFollowLists(true);
      try {
        const followerPromises = (profileUser.followers || []).map(id => getUserById(id));
        const followingPromises = (profileUser.following || []).map(id => getUserById(id));
        
        const fetchedFollowersRaw = (await Promise.all(followerPromises)).filter(u => u !== undefined) as User[];
        const fetchedFollowingRaw = (await Promise.all(followingPromises)).filter(u => u !== undefined) as User[];

        setFollowersList(fetchedFollowersRaw.map(prepareUserForClient));
        setFollowingList(fetchedFollowingRaw.map(prepareUserForClient));
      } catch (error) {
        console.error("Error fetching follow lists:", error);
      } finally {
        setIsLoadingFollowLists(false);
      }
    };
    fetchFollowLists();
  }, [profileUser, isFollowersDialogOpen, isFollowingDialogOpen]);

  // useEffect for fetchActivity REMOVED

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
                      <DialogDescription>Pessoas que seguem {profileUser.name}.</DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-[300px] pr-3 -mr-3">
                      {isLoadingFollowLists ? (
                         <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                      ) : followersList.length > 0 ? (
                        <div className="space-y-1 py-1">
                          {followersList.map(follower => ( <UserListItem key={follower.id} user={follower} onDialogClose={() => setIsFollowersDialogOpen(false)} /> ))}
                        </div>
                      ) : ( <p className="text-sm text-muted-foreground text-center py-10">Nenhum seguidor ainda.</p> )}
                    </ScrollArea>
                  </DialogContent>
                </Dialog>

                <Dialog open={isFollowingDialogOpen} onOpenChange={setIsFollowingDialogOpen}>
                  <DialogTrigger asChild>
                     <button className="text-left hover:opacity-80 transition-opacity">
                      <p className="text-2xl font-bold">{followingCount}</p>
                      <p className="text-sm text-muted-foreground">Seguindo</p>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{profileUser.name} está Seguindo</DialogTitle>
                      <DialogDescription>Pessoas que {profileUser.name} segue.</DialogDescription>
                    </DialogHeader>
                     <ScrollArea className="h-[300px] pr-3 -mr-3">
                       {isLoadingFollowLists ? (
                         <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                       ) : followingList.length > 0 ? (
                        <div className="space-y-1 py-1">
                          {followingList.map(followedUser => ( <UserListItem key={followedUser.id} user={followedUser} onDialogClose={() => setIsFollowingDialogOpen(false)}/> ))}
                        </div>
                      ) : ( <p className="text-sm text-muted-foreground text-center py-10">{profileUser.name} não segue ninguém ainda.</p> )}
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
                    initialFollowersCount={followersCount}
                    formAction={toggleFollowAction}
                  />
                </div>
              )}

              {earnedBadges.length > 0 && (
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500"/> Conquistas ({earnedBadges.length})</h3>
                  <TooltipProvider>
                    <div className="flex flex-wrap gap-2">
                        {earnedBadges.map(badge => (
                          <Tooltip key={badge.id}>
                            <TooltipTrigger asChild>
                              <ShadBadge variant="outline" className={`cursor-default border-2 p-1.5 text-xs ${badge.color || 'border-primary/50'} hover:opacity-90 flex items-center gap-1`}>
                                <badge.icon className="h-3.5 w-3.5" /> {badge.name}
                              </ShadBadge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs"><p className="text-sm font-semibold">{badge.name}</p><p className="text-xs text-muted-foreground">{badge.description}</p></TooltipContent>
                          </Tooltip>
                        ))}
                    </div>
                  </TooltipProvider>
                </div>
              )}

              {/* Recent Activity Section (Comments & Likes) REMOVED */}
              
            </CardContent>
            <CardFooter className="p-4 bg-secondary/20 border-t">
               <Button variant="outline" size="sm" asChild className="mx-auto"><Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar para a Página Inicial</Link></Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </AuthProviderClientComponent>
  );
}
