import {
  useAssemblyEventHandlers,
  UseAssemblyTableCallbacks,
} from "./useAssemblyEventHandlers";
import { AssemblyListDto } from "@/dtos";
import { columnsAssemblyList } from "@components/features/WorkTable/WorkTable.columns";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { useRowStates, useWorkTableBase } from "@/hooks";

/**
 * Tabela de assembly-lists da aba "All": estado-base (progresso/claim) + os
 * event handlers de montagem.
 */
export function useAssemblyListTable(
  assemblyLists: AssemblyListDto[],
  search: string,
  currentUserId?: number,
  callbacks?: Pick<
    UseAssemblyTableCallbacks,
    "onAssemblyListSelected" | "onAssemblyListClaim"
  >,
  searchField: string = "id",
) {
  const base = useWorkTableBase<AssemblyListDto>({
    items: assemblyLists,
    activeTab: TAB_TYPES.ALL,
    search,
    searchField,
    columns: columnsAssemblyList,
    currentUserId,
  });

  const {
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  } = useAssemblyEventHandlers(
    TAB_TYPES.ALL,
    base.rowStateAccessor,
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
