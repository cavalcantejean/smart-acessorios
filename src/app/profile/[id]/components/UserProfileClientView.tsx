
"use client";

import { useState, useEffect } from 'react';
import type { UserFirestoreData as User, Badge as BadgeType, Accessory } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserCircle, Award, Loader2, ExternalLinkIcon } from 'lucide-react';
// FollowButton and related imports (Users, UserCheck, toggleFollowAction) REMOVED
import { AuthProviderClientComponent } from '@/components/AuthProviderClientComponent';
import { getBadgeById } from '@/lib/badges';
import { Badge as ShadBadge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
// Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger REMOVED
// ScrollArea REMOVED
// UserListItem REMOVED
import { getUserById } from '@/lib/data';
import { Separator } from '@/components/ui/separator';
import { Timestamp } from 'firebase/firestore';

interface ClientUser extends Omit<User, 'createdAt' | 'updatedAt'> {
  createdAt?: string;
  updatedAt?: string;
}

interface UserProfileClientViewProps {
  profileUser: ClientUser;
}

export default function UserProfileClientView({ profileUser: initialProfileUser }: UserProfileClientViewProps) {
  const [profileUser, setProfileUser] = useState<ClientUser>(initialProfileUser);
  // followersCount, followingCount, followersList, followingList, isLoadingFollowLists, isFollowersDialogOpen, isFollowingDialogOpen states REMOVED

  const earnedBadges = (profileUser.badges || [])
    .map(badgeId => getBadgeById(badgeId))
    .filter(badge => badge !== undefined) as BadgeType[];

  useEffect(() => {
    setProfileUser(initialProfileUser);
  }, [initialProfileUser]);

  // useEffect for fetchFollowLists REMOVED

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
              {/* Follower/Following count display REMOVED */}
              {/* FollowButton REMOVED */}

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
