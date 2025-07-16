import { useState, useCallback } from "react";

// Hook for cut state management
export const useCutState = () => {
  const [informationIds, setInformationIds] = useState<Set<number>>(new Set());

  // Toggle information state
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

  // Remove from information
  const removeFromInformation = useCallback((id: number) => {
    setInformationIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Clear all information
  const clearAllInformation = useCallback(() => {
    setInformationIds(new Set());
  }, []);

  // Check if it has information items
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
