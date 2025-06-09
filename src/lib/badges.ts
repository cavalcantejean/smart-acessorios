
import type { Badge, User, Accessory, Comment, BadgeCriteriaData } from './types';
import { MessageSquare, ThumbsUp, UserPlus, Star, Users } from 'lucide-react';
import { getAllAccessories, mockUsers as allUsersData } from './data'; // Import mockUsers as allUsersData to avoid conflict

// Helper function to count comments by a user
export const countUserComments = (userId: string, accessories: Accessory[]): number => {
  return accessories.reduce((count, acc) => {
    return count + (acc.comments?.filter(comment => comment.userId === userId && comment.status === 'approved').length || 0);
  }, 0);
};

// Helper function to count likes by a user
export const countUserLikes = (userId: string, accessories: Accessory[]): number => {
  return accessories.reduce((count, acc) => {
    return count + (acc.likedBy?.includes(userId) ? 1 : 0);
  }, 0);
};

// Helper function to count how many users a user is following
export const countUserFollowing = (user: User): number => {
  return user.following?.length || 0;
};

// Helper function to count how many followers a user has
export const countUserFollowers = (user: User): number => {
  return user.followers?.length || 0;
};


export const allBadges: Badge[] = [
  {
    id: 'newbie-commenter',
    name: 'Comentarista Iniciante',
    description: 'Fez seu primeiro comentário!',
    icon: MessageSquare,
    color: 'bg-green-100 text-green-700 border-green-300',
    criteria: (user, data) => data.userCommentsCount >= 1,
  },
  {
    id: 'active-commenter',
    name: 'Comentarista Ativo',
    description: 'Fez 5 comentários ou mais.',
    icon: MessageSquare,
    color: 'bg-green-200 text-green-800 border-green-400',
    criteria: (user, data) => data.userCommentsCount >= 5,
  },
  {
    id: 'friendly-liker',
    name: 'Curtidor Amigável',
    description: 'Curtiu 3 acessórios ou mais.',
    icon: ThumbsUp,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    criteria: (user, data) => data.userLikesCount >= 3,
  },
  {
    id: 'super-liker',
    name: 'Super Curtidor',
    description: 'Curtiu 10 acessórios ou mais.',
    icon: ThumbsUp,
    color: 'bg-blue-200 text-blue-800 border-blue-400',
    criteria: (user, data) => data.userLikesCount >= 10,
  },
  {
    id: 'community-connector',
    name: 'Conector da Comunidade',
    description: 'Segue 2 usuários ou mais.',
    icon: UserPlus,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    criteria: (user, data) => data.userFollowingCount >= 2,
  },
  {
    id: 'rising-star',
    name: 'Estrela em Ascensão',
    description: 'Tem 1 seguidor ou mais.',
    icon: Star,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    criteria: (user, data) => data.userFollowersCount >= 1,
  },
  {
    id: 'local-celebrity',
    name: 'Celebridade Local',
    description: 'Tem 5 seguidores ou mais.',
    icon: Users,
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    criteria: (user, data) => data.userFollowersCount >= 5,
  },
];

export const getBadgeById = (id: string): Badge | undefined => {
  return allBadges.find(b => b.id === id);
};

export const generateBadgeCriteriaData = (user: User): BadgeCriteriaData => {
  const accessories = getAllAccessories(); // Fetch all accessories for counts
  // allUsersData is already imported from data.ts

  return {
    userCommentsCount: countUserComments(user.id, accessories),
    userLikesCount: countUserLikes(user.id, accessories),
    userFollowingCount: countUserFollowing(user),
    userFollowersCount: countUserFollowers(user),
  };
};
