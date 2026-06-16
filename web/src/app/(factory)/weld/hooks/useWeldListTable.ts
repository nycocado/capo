import { useWeldEventHandlers, UseWeldTableCallbacks } from "./useWeldEventHandlers";
import { WeldListDto } from "@/dtos";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { useRowStates, useWorkTableBase } from "@/hooks";

/**
 * Tabela de weld-lists da aba "All": compõe o estado-base da tabela com os
 * event handlers de solda.
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
  const base = useWorkTableBase<WeldListDto>({
    items: weldLists,
    activeTab: TAB_TYPES.ALL,
    search,
    currentUserId,
  });

  const { handleRowClick, handleNextWorkflow, areAllWorkingItemsFinished, isItemInFocus } =
    useWeldEventHandlers(
      TAB_TYPES.ALL,
      base.informationIds,
      base.toggleInformation,
      base.clearAllInformation,
      base.hasInformationItems,
      base.rowStateAccessor,
      base.setSelectedItem,
      weldLists,
      callbacks,
      currentUserId,
    );

  const rowStates = useRowStates(TAB_TYPES.ALL, handleRowClick);

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
  };
}
