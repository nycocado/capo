import React, { useState, useMemo, useCallback } from "react";
import { useCutEventHandlers, UseCutTableCallbacks } from "./useCutEventHandlers";
import { CutListDto, PipeLengthDto } from "@/dtos";
import { columnsCutList } from "@components/features/WorkTable/WorkTable.columns";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { useRowStates, useWorkTableBase } from "@/hooks";

// Hook for cut list table in all tab
export function useCutListTable(
  cutLists: CutListDto[],
  search: string,
  currentUserId?: number,
  callbacks?: Pick<
    UseCutTableCallbacks,
    | "onCutListSelected"
    | "onCutListSetWorking"
    | "onWorkingTransition"
    | "onItemCompleted"
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

  // Adapter para casar tipos do handler (união)
  const rowStateAccessorUnion = (item: PipeLengthDto | CutListDto) =>
    base.rowStateAccessor(item as CutListDto);

  // Event handlers - usando hook original
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
    base.setSelectedItem as React.Dispatch<React.SetStateAction<PipeLengthDto | CutListDto | null>>,
    cutLists,
    callbacks,
    currentUserId,
  );

  const rowStates = useRowStates(TAB_TYPES.ALL, handleRowClick);

  // Se uma função custom de busca foi passada, reconstroi tableItems com ela
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
