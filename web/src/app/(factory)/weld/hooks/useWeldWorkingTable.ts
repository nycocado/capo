import React, { useMemo } from "react";
import {
  useWeldEventHandlers,
  UseWeldTableCallbacks,
} from "./useWeldEventHandlers";
import { WeldListDto } from "@/dtos";
import { useRowStates, useWorkStatusAccessor, useWorkTableBase } from "@/hooks";
import { TAB_TYPES } from "@components/features/WorkTabs";

/**
 * Hook for Weld working table (WORKING tab)
 */
export function useWeldWorkingTable(
  workingWeldLists: WeldListDto[],
  search: string,
  callbacks?: Pick<UseWeldTableCallbacks, "onWeldListSelected">,
) {
  // Base genérico
  const base = useWorkTableBase<WeldListDto>({
    items: workingWeldLists,
    activeTab: TAB_TYPES.WORKING,
    search,
  });

  // Event handlers
  const {
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  } = useWeldEventHandlers(
    TAB_TYPES.WORKING,
    base.informationIds,
    base.toggleInformation,
    base.clearAllInformation,
    base.hasInformationItems,
    base.rowStateAccessor,
    base.setSelectedItem,
    workingWeldLists,
    callbacks,
  );

  // Row states configuration
  const rowStates = useRowStates(TAB_TYPES.WORKING, handleRowClick);

  return {
    tableItems: base.tableItems,
    rowStates,
    rowStateAccessor: base.rowStateAccessor,
    selectedItem: base.selectedItem,
    setSelectedItem: base.setSelectedItem,
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
    informationIds: base.informationIds,
    toggleInformation: base.toggleInformation,
    clearAllInformation: base.clearAllInformation,
    hasInformationItems: base.hasInformationItems,
    proceedToWorking: base.proceedToWorking,
  };
}
