import { useEffect } from "react";
import {
  useCutEventHandlers,
  UseCutTableCallbacks,
} from "./useCutEventHandlers";
import { CutListDto, PipeLengthDto } from "@/dtos";
import { TabType } from "@components/features/WorkTabs";
import { useRowStates, useWorkTableBase } from "@/hooks";

// Hook for general cut table management
export function useCutTable(
  items: (PipeLengthDto | CutListDto)[],
  activeTab: TabType,
  search: string,
  callbacks?: UseCutTableCallbacks,
) {
  const base = useWorkTableBase<PipeLengthDto | CutListDto>({
    items,
    activeTab,
    search,
  });

  const {
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  } = useCutEventHandlers(
    activeTab,
    base.informationIds,
    base.toggleInformation,
    base.clearAllInformation,
    base.hasInformationItems,
    base.rowStateAccessor,
    base.setSelectedItem as React.Dispatch<React.SetStateAction<PipeLengthDto | CutListDto | null>>,
    items,
    callbacks,
  );

  // Row states
  const rowStates = useRowStates(activeTab, handleRowClick);

  useEffect(() => {
    // Ao trocar de tab, limpa seleção e overlay
    base.setSelectedItem(null);
    base.clearAllInformation();
  }, [activeTab]);

  return {
    tableItems: base.tableItems,
    rowStates,
    rowStateAccessor: base.rowStateAccessor,
    selectedItem: base.selectedItem,
    handleRowClick,
    proceedToWorking: base.proceedToWorking,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  };
}
