import React, { useState, useMemo, useCallback } from "react";
import { useCutState } from "./useCutState";
import { useWorkStatusAccessor } from "./useWorkStatusAccessor";
import {
  useCutEventHandlers,
  UseCutTableCallbacks,
} from "./useCutEventHandlers";
import { useFinishedItemsSorting } from "./useFinishedItemsSorting";
import {
  useRowStates,
  sortFinishedLast,
  filterBySearch,
} from "./useTableUtils";
import { CutListDto, PipeLengthDto } from "@/dtos";
import { columnsCutList } from "@components/features/WorkTable/WorkTable.columns";
import { TAB_TYPES } from "@components/features/WorkTabs";

// Hook for cut list table in all tab
export function useCutListTable(
  cutLists: CutListDto[],
  search: string,
  currentUserId?: number,
  callbacks?: Pick<
    UseCutTableCallbacks,
    "onCutListSelected" | "onCutListSetWorking"
  >,
  searchField: string = "id",
  searchFunction?: (
    items: CutListDto[],
    search: string,
    searchField: string,
  ) => CutListDto[],
) {
  // Information overlay state management
  const {
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
  } = useCutState();

  // Selected item state
  const [selectedItem, setSelectedItem] = useState<CutListDto | null>(null);

  // Work status accessor
  const rowStateAccessor = useWorkStatusAccessor(
    TAB_TYPES.ALL,
    informationIds,
    currentUserId,
  );

  // Finished items sorting
  const { movedIds } = useFinishedItemsSorting(cutLists, [], rowStateAccessor);

  // Type-safe wrapper for setSelectedItem
  const setSelectedItemGeneric = useCallback(
    (value: React.SetStateAction<(PipeLengthDto | CutListDto) | null>) => {
      if (typeof value === "function") {
        setSelectedItem((prev) => {
          const result = value(prev);
          return result as CutListDto | null;
        });
      } else {
        setSelectedItem(value as CutListDto | null);
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
  } = useCutEventHandlers(
    TAB_TYPES.ALL,
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
    rowStateAccessor,
    setSelectedItemGeneric,
    cutLists,
    callbacks,
    currentUserId,
  );

  // Row states
  const rowStates = useRowStates(TAB_TYPES.ALL, handleRowClick);

  // Table items
  const tableItems = useMemo(() => {
    const sortedItems = sortFinishedLast(cutLists, movedIds);

    // Use custom search function if provided, otherwise use search with columns
    if (searchFunction) {
      return searchFunction(sortedItems, search, searchField);
    }

    return filterBySearch(sortedItems, search, searchField, columnsCutList);
  }, [cutLists, movedIds, search, searchField, searchFunction]);

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
