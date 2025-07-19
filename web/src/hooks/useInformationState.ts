import { useState, useCallback } from "react";

// Generic hook for information state management
export const useInformationState = () => {
  const [informationIds, setInformationIds] = useState<Set<number>>(new Set());

  // Toggle information state - clears others and adds current, or removes if already exists
  const toggleInformation = useCallback((id: number) => {
    setInformationIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.clear();
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  // Remove specific item from information
  const removeFromInformation = useCallback((id: number) => {
    setInformationIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Clear all information items
  const clearAllInformation = useCallback(() => {
    setInformationIds(new Set());
  }, []);

  // Check if there are any information items
  const hasInformationItems = useCallback(() => {
    return informationIds.size > 0;
  }, [informationIds]);

  return {
    informationIds,
    toggleInformation,
    removeFromInformation,
    clearAllInformation,
    hasInformationItems,
  };
};
