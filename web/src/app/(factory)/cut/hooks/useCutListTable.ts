import type { Dispatch, SetStateAction } from "react";
import {
  useCutEventHandlers,
  UseCutTableCallbacks,
} from "./useCutEventHandlers";
import { CutListDto } from "@/dtos";
import { PipeLengthWithContext } from "@/interfaces";
import { columnsCutList } from "@components/features/WorkTable/WorkTable.columns";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { useRowStates, useWorkTableBase } from "@/hooks";

type Row = PipeLengthWithContext | CutListDto;

/**
 * Tabela de cut-lists da aba "All": compõe o estado-base da tabela (estado por
 * progresso/claim) com os event handlers de corte.
 *
 * @param cutLists Cut-lists a exibir.
 * @param search Termo de busca atual.
 * @param currentUserId Id do utilizador atual (regras de claim/acesso).
 * @param callbacks Callbacks de seleção/claim da cut-list.
 * @param searchField Campo sobre o qual a busca incide.
 * @param searchFunction Função de busca custom; se ausente, usa a base.
 */
export function useCutListTable(
  cutLists: CutListDto[],
  search: string,
  currentUserId?: number,
  callbacks?: Pick<
    UseCutTableCallbacks,
    "onCutListSelected" | "onCutListClaim" | "onWorkingTransition" | "onItemCompleted"
  >,
  searchField: string = "id",
  searchFunction?: (
    items: CutListDto[],
    search: string,
    searchField: string,
  ) => CutListDto[],
) {
  const base = useWorkTableBase<CutListDto>({
    items: cutLists,
    activeTab: TAB_TYPES.ALL,
    search,
    searchField,
    columns: columnsCutList,
    currentUserId,
  });

  const rowStateAccessorUnion = (item: Row) =>
    base.rowStateAccessor(item as CutListDto);

  const {
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  } = useCutEventHandlers(
    TAB_TYPES.ALL,
    base.informationIds,
    base.toggleInformation,
    base.clearAllInformation,
    base.hasInformationItems,
    rowStateAccessorUnion,
    base.setSelectedItem as Dispatch<SetStateAction<Row | null>>,
    cutLists,
    callbacks,
    currentUserId,
  );

  const rowStates = useRowStates(TAB_TYPES.ALL, handleRowClick);

  const tableItems = searchFunction
    ? searchFunction(base.tableItems, search, searchField)
    : base.tableItems;

  return {
    tableItems,
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
