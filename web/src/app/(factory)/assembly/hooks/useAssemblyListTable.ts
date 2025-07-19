import React, { useState, useMemo, useCallback } from "react";
import {
  useAssemblyEventHandlers,
  UseAssemblyTableCallbacks,
} from "./useAssemblyEventHandlers";
import { AssemblyListDto } from "@/dtos";
import { TAB_TYPES } from "@components/features/WorkTabs";
import {
  filterBySearch,
  sortFinishedLast,
  useFinishedItemsSorting,
  useInformationState,
  useRowStates,
  useWorkStatusAccessor,
} from "@/hooks";

/**
 * Hook for AssemblyList table (ALL tab)
 */
export function useAssemblyListTable(
  assemblyLists: AssemblyListDto[],
  search: string,
  currentUserId?: number,
  callbacks?: Pick<
    UseAssemblyTableCallbacks,
    "onAssemblyListSelected" | "onAssemblyListSetWorking"
  >,
) {
  // Information overlay state management
  const {
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
  } = useInformationState();

  // Selected item state
  const [selectedItem, setSelectedItem] = useState<AssemblyListDto | null>(
    null,
  );

  // Work status accessor
  const rowStateAccessor = useWorkStatusAccessor(
    TAB_TYPES.ALL,
    informationIds,
    currentUserId,
  );

  // Finished items sorting
  const { movedIds } = useFinishedItemsSorting(
    assemblyLists,
    [],
    rowStateAccessor,
  );

  // Type-safe wrapper for setSelectedItem
  const setSelectedItemGeneric = useCallback(
    (value: React.SetStateAction<AssemblyListDto | null>) => {
      if (typeof value === "function") {
        setSelectedItem((prev) => {
          const result = value(prev);
          return result as AssemblyListDto | null;
        });
      } else {
        setSelectedItem(value as AssemblyListDto | null);
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
  } = useAssemblyEventHandlers(
    TAB_TYPES.ALL,
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
    rowStateAccessor,
    setSelectedItemGeneric,
    assemblyLists,
    callbacks,
    currentUserId,
  );

  // Row states configuration
  const rowStates = useRowStates(TAB_TYPES.ALL, handleRowClick);

  // Computed table items
  const tableItems = useMemo(() => {
    const sortedItems = sortFinishedLast(assemblyLists, movedIds);
    return filterBySearch(sortedItems, search);
  }, [assemblyLists, movedIds, search]);

  return {
    tableItems,
    rowStates,
    rowStateAccessor,
    selectedItem,
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
    clearAllInformation,
  };
}
