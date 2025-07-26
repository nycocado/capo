import { useState, useEffect, useMemo } from "react";
import {
  useCutEventHandlers,
  UseCutTableCallbacks,
} from "./useCutEventHandlers";
import { CutListDto, PipeLengthDto } from "@/dtos";
import { TabType } from "@components/features/WorkTabs";
import {
  filterBySearch,
  sortFinishedLast,
  useFinishedItemsSorting,
  useInformationState,
  useRowStates,
  useWorkStatusAccessor,
} from "@/hooks";

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
  } = useInformationState();

  const [selectedItem, setSelectedItem] = useState<
    (PipeLengthDto | CutListDto) | null
  >(null);
  const rowStateAccessor = useWorkStatusAccessor(activeTab, informationIds);
  // Finished items sorting - ONLY backend determines finished state
  const { movedIds } = useFinishedItemsSorting(items, rowStateAccessor);

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
