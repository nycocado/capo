import { useState, useEffect, useMemo } from "react";
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
import { TabType } from "@components/features/WorkTabs";

// Hook for general cut table management
export function useCutTable(
  items: (PipeLengthDto | CutListDto)[],
  activeTab: TabType,
  search: string,
  callbacks?: UseCutTableCallbacks,
) {
  const {
    informationIds,
    toggleInformation,
    removeFromInformation,
    clearAllInformation,
    hasInformationItems,
  } = useCutState();

  const [selectedItem, setSelectedItem] = useState<
    (PipeLengthDto | CutListDto) | null
  >(null);
  const rowStateAccessor = useWorkStatusAccessor(activeTab, informationIds);
  const { movedIds } = useFinishedItemsSorting(items, [], rowStateAccessor);

  const {
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  } = useCutEventHandlers(
    activeTab,
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
    rowStateAccessor,
    setSelectedItem,
    items,
    callbacks,
  );

  // Row states
  const rowStates = useRowStates(activeTab, handleRowClick);

  // Filtered and sorted table items
  const tableItems = useMemo(() => {
    const sortedItems = sortFinishedLast(items, movedIds);
    return filterBySearch(sortedItems, search, "id");
  }, [items, movedIds, search]);

  useEffect(() => {
    setSelectedItem(null);
    clearAllInformation();
  }, [activeTab, clearAllInformation]);

  const proceedToWorking = (id: number) => {
    removeFromInformation(id);
    const item = items.find((i) => i.id === id);
    if (item) {
      setSelectedItem(item);
    }
  };

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
  };
}
