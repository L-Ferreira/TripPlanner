import { useCallback } from 'react';

const STORAGE_KEY = 'trip-planner-textarea-heights';

interface TextareaHeights {
  [key: string]: number;
}

export const useTextareaHeights = () => {
  const getHeights = useCallback((): TextareaHeights => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }, []);

  const saveHeight = useCallback(
    (key: string, height: number) => {
      try {
        const heights = getHeights();
        heights[key] = height;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(heights));
      } catch {
        // Silently fail if localStorage is not available
      }
    },
    [getHeights]
  );

  const getHeight = useCallback(
    (key: string): number | undefined => {
      const heights = getHeights();
      return heights[key];
    },
    [getHeights]
  );

  const clearHeights = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silently fail if localStorage is not available
    }
  }, []);

  return {
    getHeight,
    saveHeight,
    clearHeights,
  };
};
