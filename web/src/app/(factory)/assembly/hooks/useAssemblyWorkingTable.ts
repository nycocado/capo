import React from "react";
import {
  useAssemblyEventHandlers,
  UseAssemblyTableCallbacks,
} from "./useAssemblyEventHandlers";
import { AssemblyListDto } from "@/dtos";
import { useRowStates, useWorkTableBase } from "@/hooks";
import { TAB_TYPES } from "@components/features/WorkTabs";

// Hook for Assembly working table (WORKING tab)
export function useAssemblyWorkingTable(
  workingAssemblyLists: AssemblyListDto[],
  search: string,
  callbacks?: Pick<UseAssemblyTableCallbacks, "onAssemblyListSelected">,
) {
  const base = useWorkTableBase<AssemblyListDto>({
    items: workingAssemblyLists,
    activeTab: TAB_TYPES.WORKING,
    search,
  });

  const { handleRowClick, handleNextWorkflow, areAllWorkingItemsFinished, isItemInFocus } =
    useAssemblyEventHandlers(
      TAB_TYPES.WORKING,
      base.informationIds,
      base.toggleInformation,
      base.clearAllInformation,
      base.hasInformationItems,
      base.rowStateAccessor,
      base.setSelectedItem,
      workingAssemblyLists,
      callbacks,
    );

  const rowStates = useRowStates(TAB_TYPES.WORKING, handleRowClick);

  return {
    tableItems: base.tableItems,
    rowStates,
    rowStateAccessor: base.rowStateAccessor,
    selectedItem: base.selectedItem,
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
    proceedToWorking: base.proceedToWorking,
    clearAllInformation: base.clearAllInformation,
  };
}
