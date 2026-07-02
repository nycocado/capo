import {
  useWeldEventHandlers,
  UseWeldTableCallbacks,
} from "./useWeldEventHandlers";
import { WeldListDto } from "@dtos";
import { columnsWeldList } from "@components/features/WorkTable/WorkTable.columns";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { useRowStates, useWorkTableBase } from "@hooks";

export function useWeldListTable(
  weldLists: WeldListDto[],
  search: string,
  currentUserId?: number,
  callbacks?: Pick<
    UseWeldTableCallbacks,
    "onWeldListSelected" | "onWeldListClaim"
  >,
  searchField: string = "id",
) {
  const base = useWorkTableBase<WeldListDto>({
    items: weldLists,
    activeTab: TAB_TYPES.ALL,
    search,
    searchField,
    columns: columnsWeldList,
    currentUserId,
  });

  const { handleRowClick, handleNextWorkflow } = useWeldEventHandlers(
    TAB_TYPES.ALL,
    base.rowStateAccessor,
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
    handleRowClick,
    handleNextWorkflow,
    clearAllInformation: base.clearAllInformation,
  };
}
