import { useCallback, useMemo } from "react";
import { WeldListDto } from "@/dtos";
import { filterBySearch } from "@/hooks";
import { useWeldOperations } from "./useWeldOperations";
import { extractWeldsFromWeldList } from "../utils/weldUtils";
import { WeldWithContext } from "@/interfaces";

export interface UseWeldGridProps {
  weldList: WeldListDto | null;
  search: string;
  onAllFinished?: () => void;
  onError?: (error: string) => void;
  handleWeldClick?: (weld: WeldWithContext) => void; // Interceptação externa
}

export function useWeldGrid({
  weldList,
  search,
  onAllFinished,
  onError,
  handleWeldClick, // Handler externo para interceptação
}: UseWeldGridProps) {
  const weldItems = useMemo(() => {
    if (!weldList) return [];
    const items = extractWeldsFromWeldList(weldList);
    return filterBySearch(items, search, "number");
  }, [weldList, search]);

  const weldOperations = useWeldOperations({
    onAllFinished,
    onError,
    // Removendo onWeldRequiresData - agora é interceptado externamente
  });

  // Override do handleItemClick para usar interceptação externa
  const handleItemClick = useCallback(
    (weld: WeldWithContext) => {
      if (handleWeldClick) {
        // Usa handler externo (interceptação)
        handleWeldClick(weld);
      } else {
        // Fallback para o sistema original
        weldOperations.handleWeldClick(weld);
      }
    },
    [handleWeldClick, weldOperations.handleWeldClick],
  );

  const handleNextWorkflow = useCallback(async () => {
    await weldOperations.handleNextWeld(weldItems);
  }, [weldOperations, weldItems]);

  const areAllWorkingItemsFinished = useCallback(() => {
    return weldOperations.areAllWeldsFinished(weldItems);
  }, [weldOperations, weldItems]);

  return {
    weldItems,
    selectedWeld: weldOperations.selectedWeld,
    handleItemClick,
    itemStates: weldOperations.itemStates,
    itemStateAccessor: weldOperations.itemStateAccessor,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isSubmitting: weldOperations.isSubmitting,
  };
}
