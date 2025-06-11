
import type { Badge, UserFirestoreData, Accessory, Comment, BadgeCriteriaData } from './types';
import { MessageSquare, ThumbsUp, UserPlus, Star, Users } from 'lucide-react';
import { getAllAccessories, getUserById } from './data'; // Import Firestore based getUserById
import { collection, getDocs, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from './firebase';


// Helper function to count comments by a user from Firestore
export const countUserComments = async (userId: string): Promise<number> => {
  if (!db) return 0;
  let totalComments = 0;
  // This is inefficient as it fetches all accessories.
  // A better approach would be a dedicated 'comments' collection queryable by userId.
  // For now, sticking to the current structure:
  const accessories = await getAllAccessories(); // Fetches from Firestore
  accessories.forEach(acc => {
    totalComments += (acc.comments?.filter(c => c.userId === userId && c.status === 'approved').length || 0);
  });
  return totalComments;
};

// Helper function to count likes by a user from Firestore
export const countUserLikes = async (userId: string): Promise<number> => {
  if (!db) return 0;
  const accessoriesQuery = query(collection(db, "acessorios"), where("likedBy", "array-contains", userId));
  try {
    const snapshot = await getCountFromServer(accessoriesQuery);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error counting user likes:", error);
    return 0;
  }
};

// Helper function to count how many users a user is following (uses UserFirestoreData)
export const countUserFollowing = (user: UserFirestoreData): number => {
  return user.following?.length || 0;
};

// Helper function to count how many followers a user has (uses UserFirestoreData)
export const countUserFollowers = (user: UserFirestoreData): number => {
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

// Now async as it fetches data from Firestore
export const generateBadgeCriteriaData = async (user: UserFirestoreData): Promise<BadgeCriteriaData> => {
  return {
    userCommentsCount: await countUserComments(user.id),
    userLikesCount: await countUserLikes(user.id),
    userFollowingCount: countUserFollowing(user), // This uses data already on the user object
    userFollowersCount: countUserFollowers(user), // This uses data already on the user object
  };
};
