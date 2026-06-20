import {
  useState,
  useMemo,
  useCallback,
  type Dispatch,
  type SetStateAction,
} from "react";
import { TabType } from "@components/features/WorkTabs";
import { Column } from "@components/features/WorkTable/WorkTable";
import { filterBySearch, sortFinishedLast } from "./useTableUtils";
import { useInformationState } from "./useInformationState";
import { listToUiState, useWorkStatusAccessor } from "./useWorkStatusAccessor";
import { useFinishedItemsSorting } from "./useFinishedItemsSorting";

type ListLike = {
  id: number;
  progress?: string;
  claimedBy?: { id: number } | null;
};

export interface UseWorkTableBaseParams<T> {
  items: T[];
  activeTab: TabType;
  search: string;
  searchField?: string;
  columns?: Column<T>[];
  currentUserId?: number;
}

export function useWorkTableBase<T extends ListLike>({
  items,
  search,
  searchField = "id",
  columns,
  currentUserId,
}: UseWorkTableBaseParams<T>) {
  const info = useInformationState();
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const resolveRawState = useCallback(
    (item: T) => listToUiState(item, currentUserId),
    [currentUserId],
  );
  const rowStateAccessor = useWorkStatusAccessor<T>(
    info.informationIds,
    resolveRawState,
  );

  const { movedIds } = useFinishedItemsSorting<T>(items, rowStateAccessor);

  const setSelectedItemGeneric = useCallback(
    (value: SetStateAction<T | null>) => setSelectedItem(value),
    [],
  ) as Dispatch<SetStateAction<T | null>>;

  const tableItems = useMemo(() => {
    const sorted = sortFinishedLast(items, movedIds);
    return filterBySearch(
      sorted as T[],
      search,
      searchField,
      columns as Column<T>[] | undefined,
    );
  }, [items, movedIds, search, searchField, columns]);

  const proceedToWorking = useCallback(
    (id: number) => {
      info.removeFromInformation(id);
      const item = items.find((i) => i.id === id);
      if (item) setSelectedItem(item);
    },
    [info, items],
  );

  return {
    informationIds: info.informationIds,
    toggleInformation: info.toggleInformation,
    removeFromInformation: info.removeFromInformation,
    clearAllInformation: info.clearAllInformation,
    hasInformationItems: info.hasInformationItems,
    selectedItem,
    setSelectedItem: setSelectedItemGeneric,
    rowStateAccessor,
    movedIds,
    tableItems,
    proceedToWorking,
  } as const;
}
