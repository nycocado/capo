import { useCallback, useMemo } from "react";
import { AssemblyListDto } from "@/dtos";
import { filterBySearch } from "@/hooks";
import { useJointOperations } from "./useJointOperations";
import { extractWeldsFromAssemblyList } from "../utils/assemblyClientUtils";

export interface UseWeldGridProps {
  assemblyList: AssemblyListDto | null;
  sheetNumber: number | null;
  search: string;
  onAllFinished?: () => void;
  onError?: (error: string) => void;
}

export function useWeldGrid({
  assemblyList,
  sheetNumber,
  search,
  onAllFinished,
  onError,
}: UseWeldGridProps) {
  const weldItems = useMemo(() => {
    if (!assemblyList || sheetNumber == null) return [];
    const items = extractWeldsFromAssemblyList(assemblyList, sheetNumber);
    return filterBySearch(items, search, "number");
  }, [assemblyList, sheetNumber, search]);

  const jointOperations = useJointOperations({
    selectedAssemblyList: assemblyList,
    onAllFinished,
    onError,
  });

  const handleNextWorkflow = useCallback(async () => {
    await jointOperations.handleNextWeld(weldItems);
  }, [jointOperations, weldItems]);

  const areAllWorkingItemsFinished = useCallback(() => {
    return jointOperations.areAllJointsFinished(weldItems);
  }, [jointOperations, weldItems]);

  return {
    weldItems,
    selectedWeld: jointOperations.selectedWeld,
    handleItemClick: jointOperations.handleWeldClick,
    itemStates: jointOperations.itemStates,
    itemStateAccessor: jointOperations.itemStateAccessor,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isSubmitting: jointOperations.isSubmitting,
  };
}
