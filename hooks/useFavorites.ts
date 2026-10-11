"use client";

import { useState, useEffect, useCallback } from "react";
import { Token } from "@/types/token";

const STORAGE_KEY = "monad_alpha_favorite_tokens";
const FAVORITES_EVENT = "monad_alpha_favorites_updated";

export function useFavorites() {
  const [favorites, setFavorites] = useState<Token[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setFavorites(parsed);
          }
        } else {
          setFavorites([]);
        }
      } catch (err) {
        console.error("Failed to parse favorite tokens from localStorage:", err);
      } finally {
        setIsLoaded(true);
      }
    };

    loadFavorites();

    // Listen to custom cross-component update events & storage events
    const handleUpdate = () => {
      loadFavorites();
    };

    window.addEventListener(FAVORITES_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener(FAVORITES_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Save to localStorage & notify listeners
  const saveFavorites = useCallback((newFavorites: Token[]) => {
    setFavorites(newFavorites);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      window.dispatchEvent(new Event(FAVORITES_EVENT));
    } catch (err) {
      console.error("Failed to save favorite tokens to localStorage:", err);
    }
  }, []);

  // Check if token is favorited by contract address or token id
  const isFavorite = useCallback(
    (addressOrId: string): boolean => {
      if (!addressOrId) return false;
      const cleanTarget = addressOrId.toLowerCase();
      return favorites.some(
        (t) =>
          t.address.toLowerCase() === cleanTarget ||
          t.id.toLowerCase() === cleanTarget ||
          t.symbol.toLowerCase().replace("$", "") === cleanTarget
      );
    },
    [favorites]
  );

  // Remove a favorite token by address or id
  const removeFavorite = useCallback(
    (addressOrId: string) => {
      if (!addressOrId) return;
      const cleanTarget = addressOrId.toLowerCase();
      const updated = favorites.filter(
        (t) =>
          t.address.toLowerCase() !== cleanTarget &&
          t.id.toLowerCase() !== cleanTarget &&
          t.symbol.toLowerCase().replace("$", "") !== cleanTarget
      );
      saveFavorites(updated);
    },
    [favorites, saveFavorites]
  );

  // Toggle favorite token state
  const toggleFavorite = useCallback(
    (token: Token) => {
      if (!token) return;
      const exists = isFavorite(token.address) || isFavorite(token.id);
      if (exists) {
        removeFavorite(token.address || token.id);
      } else {
        const updated = [token, ...favorites.filter((t) => t.address.toLowerCase() !== token.address.toLowerCase())];
        saveFavorites(updated);
      }
    },
    [favorites, isFavorite, removeFavorite, saveFavorites]
  );

  // Clear all favorites
  const clearFavorites = useCallback(() => {
    saveFavorites([]);
  }, [saveFavorites]);

  return {
    favorites,
    isLoaded,
    isFavorite,
    toggleFavorite,
    removeFavorite,
    clearFavorites,
    favoritesCount: favorites.length,
  };
}
