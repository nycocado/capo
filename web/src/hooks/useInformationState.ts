import { useState, useCallback } from "react";

/**
 * Gerencia o conjunto de ids em estado "information" (seleção local pré-working):
 * no máximo um item pode estar em information por vez — ao adicionar um novo,
 * os demais são removidos.
 */
export const useInformationState = () => {
  const [informationIds, setInformationIds] = useState<Set<number>>(new Set());

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

  const removeFromInformation = useCallback((id: number) => {
    setInformationIds((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const clearAllInformation = useCallback(() => {
    setInformationIds(new Set());
  }, []);

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
