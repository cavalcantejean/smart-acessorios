
import type { Badge, UserFirestoreData, Accessory, BadgeCriteriaData } from './types';
import { UserPlus, Star, Users } from 'lucide-react'; // Removed MessageSquare, ThumbsUp
import { getAllAccessories, getUserById } from './data'; 
import { collection, getDocs, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from './firebase';


// countUserComments REMOVED
// countUserLikes REMOVED

// Helper function to count how many users a user is following (uses UserFirestoreData)
export const countUserFollowing = (user: UserFirestoreData): number => {
  return user.following?.length || 0;
};

// Helper function to count how many followers a user has (uses UserFirestoreData)
export const countUserFollowers = (user: UserFirestoreData): number => {
  return user.followers?.length || 0;
};


export const allBadges: Badge[] = [
  // Commenter and Liker badges REMOVED
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

export const generateBadgeCriteriaData = async (user: UserFirestoreData): Promise<BadgeCriteriaData> => {
  return {
    // userCommentsCount: await countUserComments(user.id), // REMOVED
    // userLikesCount: await countUserLikes(user.id), // REMOVED
    userFollowingCount: countUserFollowing(user), 
    userFollowersCount: countUserFollowers(user), 
  };
};
