
"use client";
import type {Accessory} from '@/lib/types';
import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = 'smartAccessoryFavorites';

function getStoredFavoriteIds(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }
  const stored = localStorage.getItem(FAVORITES_KEY);
  try {
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Error parsing favorites from localStorage", e);
    return [];
  }
}

function storeFavoriteIds(ids: string[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(ids));
  }
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    setFavoriteIds(getStoredFavoriteIds());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds(prevIds => {
      const newIds = prevIds.includes(id)
        ? prevIds.filter(favId => favId !== id)
        : [...prevIds, id];
      storeFavoriteIds(newIds);
      // Dispatch a custom event to notify other components or tabs
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('favoritesUpdated', { detail: newIds }));
      }
      return newIds;
    });
  }, []);
  
  useEffect(() => {
    const handleStorageChange = () => {
      setFavoriteIds(getStoredFavoriteIds());
    };

    const handleFavoritesUpdated = (event: Event) => {
      if ((event as CustomEvent).detail) {
        const newIds = (event as CustomEvent).detail as string[];
        // Defer this state update to run after the current JavaScript task,
        // preventing updates during another component's render phase.
        setTimeout(() => {
          setFavoriteIds(newIds);
        }, 0);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('favoritesUpdated', handleFavoritesUpdated);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('favoritesUpdated', handleFavoritesUpdated);
      }
    };
  }, []);


  const isFavorite = useCallback((id: string) => {
    return favoriteIds.includes(id);
  }, [favoriteIds]);

  return { favoriteIds, toggleFavorite, isFavorite };
}
