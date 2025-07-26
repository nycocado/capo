import { CutListDto, PipeLengthDto } from "@/dtos";
import { useCutEventHandlers } from "@/app/(factory)/cut/hooks/useCutEventHandlers";
import React, { useCallback, useMemo, useState } from "react";
import { TAB_TYPES } from "@components/features/WorkTabs";
import {
  filterBySearch,
  sortFinishedLast,
  useFinishedItemsSorting,
  useInformationState,
  useRowStates,
  useWorkStatusAccessor,
} from "@/hooks";

// Interface específica para PipeLengthTable
interface UsePipeLengthTableCallbacks {
  onWorkingTransition?: (item: PipeLengthDto) => void;
  onItemCompleted?: (item: PipeLengthDto) => void;
  onItemSelected?: (item: PipeLengthDto) => void;
}

// Hook for pipe length table in working tab
export function usePipeLengthTable(
  pipeLengths: PipeLengthDto[],
  search: string,
  callbacks?: UsePipeLengthTableCallbacks,
  searchField: string = "id",
  searchFunction?: (
    items: PipeLengthDto[],
    search: string,
    searchField: string,
  ) => PipeLengthDto[],
) {
  const {
    informationIds,
    toggleInformation,
    removeFromInformation,
    clearAllInformation,
    hasInformationItems,
  } = useInformationState();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  // Selected item memo
  const selectedItem = useMemo(
    () => pipeLengths.find((i) => i.id === selectedId) ?? null,
    [pipeLengths, selectedId],
  );
  const rowStateAccessor = useWorkStatusAccessor(
    TAB_TYPES.WORKING,
    informationIds,
  );
  // Finished items sorting - ONLY backend determines finished state
  const { movedIds } = useFinishedItemsSorting(
    pipeLengths,
    rowStateAccessor,
  );

  // Type-safe wrapper for setSelectedItem
  const setSelectedItemGeneric = useCallback(
    (value: React.SetStateAction<(PipeLengthDto | CutListDto) | null>) => {
      if (typeof value === "function") {
        setSelectedId(() => {
          const result = value(selectedItem);
          return result?.id ?? null;
        });
      } else {
        setSelectedId(value?.id ?? null);
      }
    },
    [selectedItem],
  );

  // Event handlers
  const {
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  } = useCutEventHandlers(
    TAB_TYPES.WORKING,
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
    rowStateAccessor,
    setSelectedItemGeneric,
    pipeLengths,
    callbacks,
  );

  // Row states
  const rowStates = useRowStates(TAB_TYPES.WORKING, handleRowClick);

  // Table items
  const tableItems = useMemo(() => {
    const sortedItems = sortFinishedLast(pipeLengths, movedIds);

    // Use custom search function if provided, otherwise fallback to simple search
    if (searchFunction) {
      return searchFunction(sortedItems, search, searchField);
    }

    return filterBySearch(sortedItems, search, searchField);
  }, [pipeLengths, movedIds, search, searchField, searchFunction]);

  // Proceed to working
  const proceedToWorking = (id: number) => {
    removeFromInformation(id);
    setSelectedId(id);
  };

  // Clear selection
  const clearSelection = () => setSelectedId(null);

  return {
    tableItems,
    rowStates,
    rowStateAccessor,
    selectedItem,
    handleRowClick,
    proceedToWorking,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
    clearAllInformation,
    clearSelection,
  };
}
