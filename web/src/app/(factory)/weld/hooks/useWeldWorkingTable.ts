import React, { useState, useMemo, useCallback } from "react";
import {
  useWeldEventHandlers,
  UseWeldTableCallbacks,
} from "./useWeldEventHandlers";
import { WeldListDto } from "@/dtos";
import {
  filterBySearch,
  sortFinishedLast,
  useFinishedItemsSorting,
  useInformationState,
  useRowStates,
  useWorkStatusAccessor,
} from "@/hooks";
import { TAB_TYPES } from "@components/features/WorkTabs";

/**
 * Hook for Weld working table (WORKING tab)
 */
export function useWeldWorkingTable(
  workingWeldLists: WeldListDto[],
  search: string,
  callbacks?: Pick<UseWeldTableCallbacks, "onWeldListSelected">,
) {
  const {
    informationIds,
    toggleInformation,
    removeFromInformation,
    clearAllInformation,
    hasInformationItems,
  } = useInformationState();

  const [selectedItem, setSelectedItem] = useState<WeldListDto | null>(null);

  const rowStateAccessor = useWorkStatusAccessor(
    TAB_TYPES.WORKING,
    informationIds,
  );

  // Finished items sorting - ONLY backend determines finished state
  const { movedIds } = useFinishedItemsSorting(workingWeldLists, rowStateAccessor);

  // Type-safe wrapper for setSelectedItem
  const setSelectedItemGeneric = useCallback(
    (value: React.SetStateAction<WeldListDto | null>) => {
      if (typeof value === "function") {
        setSelectedItem((prev) => {
          const result = value(prev);
          return result as WeldListDto | null;
        });
      } else {
        setSelectedItem(value as WeldListDto | null);
      }
    },
    [],
  );

  // Event handlers
  const {
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  } = useWeldEventHandlers(
    TAB_TYPES.WORKING,
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
    rowStateAccessor,
    setSelectedItemGeneric,
    workingWeldLists,
    callbacks,
  );

  // Row states configuration
  const rowStates = useRowStates(TAB_TYPES.WORKING, handleRowClick);

  // Computed table items
  const tableItems = useMemo(() => {
    const sortedItems = sortFinishedLast(workingWeldLists, movedIds);
    return filterBySearch(sortedItems, search);
  }, [workingWeldLists, movedIds, search]);

  // Handle item transition to working state
  const proceedToWorking = (id: number) => {
    removeFromInformation(id);
    const item = workingWeldLists.find((i) => i.id === id);
    if (item) {
      setSelectedItem(item);
    }
  };

  return {
    tableItems,
    rowStates,
    rowStateAccessor,
    selectedItem,
    setSelectedItem,
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
    proceedToWorking,
  };
}
