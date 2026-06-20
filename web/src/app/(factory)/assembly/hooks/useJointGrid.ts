import { useCallback, useMemo } from "react";
import { AssemblyListDto } from "@/dtos";
import { filterBySearch } from "@/hooks";
import { useJointOperations } from "./useJointOperations";
import { extractWeldsFromAssemblyList } from "../utils/assemblyUtils";

export interface UseJointGridProps {
  assemblyList: AssemblyListDto | null;
  search: string;
  onAllFinished?: () => void;
  onError?: (error: string) => void;
}

export function useJointGrid({
  assemblyList,
  search,
  onAllFinished,
  onError,
}: UseJointGridProps) {
  const weldItems = useMemo(() => {
    if (!assemblyList) return [];
    const items = extractWeldsFromAssemblyList(assemblyList);
    return filterBySearch(items, search, "number");
  }, [assemblyList, search]);

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
    handleItemClick: jointOperations.handleJointClick,
    itemStates: jointOperations.itemStates,
    itemStateAccessor: jointOperations.itemStateAccessor,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isSubmitting: jointOperations.isSubmitting,
  };
}
