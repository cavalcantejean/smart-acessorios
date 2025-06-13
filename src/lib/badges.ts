
import type { Badge, UserFirestoreData, BadgeCriteriaData } from './types';
import { UserPlus, Star, Users, Award as PlaceholderIcon } from 'lucide-react'; // Removed MessageSquare, ThumbsUp. Added PlaceholderIcon
import { getAllAccessories, getUserById } from './data'; 
import { collection, getDocs, query, where, getCountFromServer } from 'firebase/firestore';
import { db } from './firebase';


// countUserComments REMOVED
// countUserLikes REMOVED
// countUserFollowing REMOVED
// countUserFollowers REMOVED


export const allBadges: Badge[] = [
  // Follower/Following badges REMOVED
  // Example placeholder badge if all others are removed.
  // You can add new badges based on different criteria here.
  {
    id: 'early-adopter',
    name: 'Pioneiro',
    description: 'Se cadastrou na plataforma.',
    icon: PlaceholderIcon, // Using a generic icon for now
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    criteria: (user, data) => !!user.createdAt, // Example: true if user has a createdAt timestamp
  },
];

export const getBadgeById = (id: string): Badge | undefined => {
  return allBadges.find(b => b.id === id);
};

export const generateBadgeCriteriaData = async (user: UserFirestoreData): Promise<BadgeCriteriaData> => {
  return {
    // userCommentsCount: await countUserComments(user.id), // REMOVED
    // userLikesCount: await countUserLikes(user.id), // REMOVED
    // userFollowingCount: countUserFollowing(user), // REMOVED
    // userFollowersCount: countUserFollowers(user), // REMOVED
    placeholder: true, // Added placeholder as all criteria were removed
  };
};

