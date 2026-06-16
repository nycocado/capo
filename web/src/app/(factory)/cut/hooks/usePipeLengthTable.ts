import { CutListDto, PipeLengthDto } from "@/dtos";
import { useCutEventHandlers } from "@/app/(factory)/cut/hooks/useCutEventHandlers";
import React, { useCallback, useMemo, useState } from "react";
import { TAB_TYPES } from "@components/features/WorkTabs";
import {
  filterBySearch,
  sortFinishedLast,
  useFinishedItemsSorting,
  useInformationState,
  useRowStates,
  useWorkStatusAccessor,
} from "@/hooks";

interface UsePipeLengthTableCallbacks {
  onWorkingTransition?: (item: PipeLengthDto) => void;
  onItemCompleted?: (item: PipeLengthDto) => void;
  onItemSelected?: (item: PipeLengthDto) => void;
}

/**
 * Gerencia a tabela de pipe-lengths na aba Working: ordenação, busca,
 * seleção, estados de linha e navegação entre itens.
 *
 * @param pipeLengths Pipe-lengths derivados da cut-list selecionada.
 * @param search Texto de busca atual.
 * @param callbacks Ações disparadas pelas transições de estado de cada pipe-length.
 * @param searchField Campo de busca ativo.
 * @param searchFunction Função de busca customizada; usa filterBySearch por padrão.
 */
export function usePipeLengthTable(
  pipeLengths: PipeLengthDto[],
  search: string,
  callbacks?: UsePipeLengthTableCallbacks,
  searchField: string = "id",
  searchFunction?: (
    items: PipeLengthDto[],
    search: string,
    searchField: string,
  ) => PipeLengthDto[],
) {
  const {
    informationIds,
    toggleInformation,
    removeFromInformation,
    clearAllInformation,
    hasInformationItems,
  } = useInformationState();

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selectedItem = useMemo(
    () => pipeLengths.find((i) => i.id === selectedId) ?? null,
    [pipeLengths, selectedId],
  );
  const rowStateAccessor = useWorkStatusAccessor(
    TAB_TYPES.WORKING,
    informationIds,
  );
  // O backend é a única fonte de verdade do estado finished: sem estado local de "moved".
  const { movedIds } = useFinishedItemsSorting(
    pipeLengths,
    rowStateAccessor,
  );

  const setSelectedItemGeneric = useCallback(
    (value: React.SetStateAction<(PipeLengthDto | CutListDto) | null>) => {
      if (typeof value === "function") {
        setSelectedId(() => {
          const result = value(selectedItem);
          return result?.id ?? null;
        });
      } else {
        setSelectedId(value?.id ?? null);
      }
    },
    [selectedItem],
  );

  const {
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  } = useCutEventHandlers(
    TAB_TYPES.WORKING,
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
    rowStateAccessor,
    setSelectedItemGeneric,
    pipeLengths,
    callbacks,
  );

  const rowStates = useRowStates(TAB_TYPES.WORKING, handleRowClick);

  const tableItems = useMemo(() => {
    const sortedItems = sortFinishedLast(pipeLengths, movedIds);

    if (searchFunction) {
      return searchFunction(sortedItems, search, searchField);
    }

    return filterBySearch(sortedItems, search, searchField);
  }, [pipeLengths, movedIds, search, searchField, searchFunction]);

  const proceedToWorking = (id: number) => {
    removeFromInformation(id);
    setSelectedId(id);
  };

  const clearSelection = () => setSelectedId(null);

  return {
    tableItems,
    rowStates,
    rowStateAccessor,
    selectedItem,
    handleRowClick,
    proceedToWorking,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
    clearAllInformation,
    clearSelection,
  };
}
