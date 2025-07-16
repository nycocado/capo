import { CutListDto, PipeLengthDto } from "@/dtos";
import {
  useCutEventHandlers,
  UseCutTableCallbacks,
} from "@/app/(factory)/cut/hooks/useCutEventHandlers";
import { useCutState } from "@/app/(factory)/cut/hooks/useCutState";
import React, { useCallback, useMemo, useState } from "react";
import { useWorkStatusAccessor } from "@/app/(factory)/cut/hooks/useWorkStatusAccessor";
import { TAB_TYPES } from "@components/features/factory/WorkTabs";
import { useFinishedItemsSorting } from "@/app/(factory)/cut/hooks/useFinishedItemsSorting";
import {
  filterBySearch,
  sortFinishedLast,
  useRowStates,
} from "@/app/(factory)/cut/hooks/useTableUtils";

// Hook for pipe length table in working tab
export function usePipeLengthTable(
  pipeLengths: PipeLengthDto[],
  search: string,
  callbacks?: Pick<
    UseCutTableCallbacks,
    "onWorkingTransition" | "onItemCompleted"
  >,
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
  } = useCutState();

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
  const { movedIds } = useFinishedItemsSorting(
    pipeLengths,
    [],
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
    selectedItem, // agora derivado
    handleRowClick,
    proceedToWorking,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
    clearAllInformation,
    clearSelection,
  };
}
