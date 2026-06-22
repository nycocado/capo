import { CutListDto } from "@dtos";
import { PipeLengthWithContext } from "@interfaces";
import { useCutEventHandlers } from "./useCutEventHandlers";
import {
  useCallback,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { TAB_TYPES } from "@components/features/WorkTabs";
import {
  filterBySearch,
  sortFinishedLast,
  statusToUiState,
  useFinishedItemsSorting,
  useInformationState,
  useRowStates,
  useWorkStatusAccessor,
} from "@hooks";

interface UsePipeLengthTableCallbacks {
  onWorkingTransition?: (item: PipeLengthWithContext) => void;
  onItemCompleted?: (item: PipeLengthWithContext) => void;
  onItemSelected?: (item: PipeLengthWithContext) => void;
}

type Row = PipeLengthWithContext | CutListDto;

export function usePipeLengthTable(
  pipeLengths: PipeLengthWithContext[],
  search: string,
  callbacks?: UsePipeLengthTableCallbacks,
  searchField: string = "id",
  searchFunction?: (
    items: PipeLengthWithContext[],
    search: string,
    searchField: string,
  ) => PipeLengthWithContext[],
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

  const resolveRawState = useCallback(
    (item: Row) => statusToUiState((item as PipeLengthWithContext).status),
    [],
  );
  const rowStateAccessor = useWorkStatusAccessor<Row>(
    informationIds,
    resolveRawState,
  );

  const { movedIds } = useFinishedItemsSorting(pipeLengths, rowStateAccessor);

  const setSelectedItemGeneric = useCallback(
    (value: SetStateAction<Row | null>) => {
      if (typeof value === "function") {
        setSelectedId(() => {
          const result = (value as (prev: Row | null) => Row | null)(
            selectedItem,
          );
          return result?.id ?? null;
        });
      } else {
        setSelectedId(value?.id ?? null);
      }
    },
    [selectedItem],
  ) as Dispatch<SetStateAction<Row | null>>;

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
    const sorted = sortFinishedLast(pipeLengths, movedIds);
    return searchFunction
      ? searchFunction(sorted, search, searchField)
      : filterBySearch(sorted, search, searchField);
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
