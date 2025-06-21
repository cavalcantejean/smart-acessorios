
"use server";

import type { User } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserCircle } from 'lucide-react';

interface UserListItemProps {
  user: User;
  onDialogClose?: () => void; 
}

export default function UserListItem({ user, onDialogClose }: UserListItemProps) {
  return (
    <Link
      href={`/profile/${user.id}`}
      onClick={onDialogClose} // Closes the dialog when a profile is clicked
      className="flex items-center gap-3 p-2 -mx-2 rounded-md hover:bg-muted transition-colors"
      passHref
    >
      <Avatar className="h-10 w-10">
        {user.avatarUrl ? (
          <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint={user.avatarHint || "user avatar"} />
        ) : null}
        <AvatarFallback>
          <UserCircle className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-grow">
        <p className="font-semibold text-sm text-foreground">{user.name}</p>
        {user.bio && <p className="text-xs text-muted-foreground line-clamp-1">{user.bio}</p>}
      </div>
    </Link>
  );
}
