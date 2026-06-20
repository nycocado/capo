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
  handleWeldClick: (weld: WeldWithContext) => void;
}

export function useWeldGrid({
  weldList,
  search,
  onAllFinished,
  handleWeldClick,
}: UseWeldGridProps) {
  const weldOps = useWeldOperations();

  const weldItems = useMemo(() => {
    if (!weldList) return [];
    return filterBySearch(extractWeldsFromWeldList(weldList), search, "number");
  }, [weldList, search]);

  const handleItemClick = useCallback(
    (weld: WeldWithContext) => handleWeldClick(weld),
    [handleWeldClick],
  );

  const handleNextWorkflow = useCallback(async () => {
    const next = weldItems.find((w) => weldOps.getWeldState(w) === "to-do");
    if (next) handleWeldClick(next);
    else onAllFinished?.();
  }, [weldItems, weldOps, handleWeldClick, onAllFinished]);

  const areAllWorkingItemsFinished = useCallback(
    () => weldOps.areAllWeldsFinished(weldItems),
    [weldOps, weldItems],
  );

  return {
    weldItems,
    handleItemClick,
    itemStates: weldOps.itemStates,
    itemStateAccessor: weldOps.itemStateAccessor,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
  };
}
