import { useState, useMemo } from "react";
import {
  useWeldEventHandlers,
  UseWeldTableCallbacks,
} from "./useWeldEventHandlers";
import { WeldListDto } from "@/dtos";
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
 * Hook for WeldList table (ALL tab)
 */
export function useWeldListTable(
  weldLists: WeldListDto[],
  search: string,
  currentUserId?: number,
  callbacks?: Pick<
    UseWeldTableCallbacks,
    "onWeldListSelected" | "onWeldListSetWorking"
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
  const [selectedItem, setSelectedItem] = useState<WeldListDto | null>(null);

  // Work status accessor
  const rowStateAccessor = useWorkStatusAccessor(
    TAB_TYPES.ALL,
    informationIds,
    currentUserId,
  );

  // Finished items sorting - ONLY backend determines finished state
  const { movedIds } = useFinishedItemsSorting(
    weldLists,
    rowStateAccessor,
  );

  // Event handlers
  const {
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  } = useWeldEventHandlers(
    TAB_TYPES.ALL,
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
    rowStateAccessor,
    setSelectedItem,
    weldLists,
    callbacks,
    currentUserId,
  );

  // Row states configuration
  const rowStates = useRowStates(TAB_TYPES.ALL, handleRowClick);

  // Computed table items
  const tableItems = useMemo(() => {
    const sortedItems = sortFinishedLast(weldLists, movedIds);
    return filterBySearch(sortedItems, search);
  }, [weldLists, movedIds, search]);

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
  };
}
