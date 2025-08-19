import { useAssemblyEventHandlers, UseAssemblyTableCallbacks } from "./useAssemblyEventHandlers";
import { AssemblyListDto } from "@/dtos";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { useRowStates, useWorkTableBase } from "@/hooks";

/**
 * Hook for AssemblyList table (ALL tab)
 */
export function useAssemblyListTable(
  assemblyLists: AssemblyListDto[],
  search: string,
  currentUserId?: number,
  callbacks?: Pick<
    UseAssemblyTableCallbacks,
    "onAssemblyListSelected" | "onAssemblyListSetWorking"
  >,
) {
  const base = useWorkTableBase<AssemblyListDto>({
    items: assemblyLists,
    activeTab: TAB_TYPES.ALL,
    search,
    currentUserId,
  });

  const { handleRowClick, handleNextWorkflow, areAllWorkingItemsFinished, isItemInFocus } =
    useAssemblyEventHandlers(
      TAB_TYPES.ALL,
      base.informationIds,
      base.toggleInformation,
      base.clearAllInformation,
      base.hasInformationItems,
      base.rowStateAccessor,
      base.setSelectedItem,
      assemblyLists,
      callbacks,
      currentUserId,
    );

  const rowStates = useRowStates(TAB_TYPES.ALL, handleRowClick);

  return {
    tableItems: base.tableItems,
    rowStates,
    rowStateAccessor: base.rowStateAccessor,
    selectedItem: base.selectedItem,
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
    clearAllInformation: base.clearAllInformation,
  };
}
