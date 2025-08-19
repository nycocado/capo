import { useState, useMemo, useCallback } from "react";
import { TabType } from "@components/features/WorkTabs";
import { Column } from "@components/features/WorkTable/WorkTable";
import { filterBySearch, sortFinishedLast } from "./useTableUtils";
import { useInformationState } from "./useInformationState";
import { useWorkStatusAccessor } from "./useWorkStatusAccessor";
import { useFinishedItemsSorting } from "./useFinishedItemsSorting";
import { WorkStatusDto } from "@/dtos";

export interface UseWorkTableBaseParams<T> {
  items: T[];
  activeTab: TabType;
  search: string;
  searchField?: string;
  columns?: Column<T>[];
  currentUserId?: number;
}

export function useWorkTableBase<
  T extends { id: number; workStatus?: WorkStatusDto }
>({
  items,
  activeTab,
  search,
  searchField = "id",
  columns,
  currentUserId,
}: UseWorkTableBaseParams<T>) {
  const info = useInformationState();

  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  const rowStateAccessor = useWorkStatusAccessor<T>(
    activeTab,
    info.informationIds,
    currentUserId,
  );

  const { movedIds } = useFinishedItemsSorting<T>(items, rowStateAccessor);

  // Wrapper somente para manter tipagem estável
  const setSelectedItemGeneric = useCallback(
    (value: React.SetStateAction<T | null>) => {
      setSelectedItem(value);
    },
    [],
  );

  const tableItems = useMemo(() => {
    const sorted = sortFinishedLast(items, movedIds);
    return filterBySearch(sorted as T[], search, searchField, columns as Column<T>[] | undefined);
  }, [items, movedIds, search, searchField, columns]);

  const proceedToWorking = useCallback(
    (id: number) => {
      info.removeFromInformation(id);
      const item = items.find((i) => (i as any).id === id);
      if (item) setSelectedItem(item);
    },
    [info, items],
  );

  return {
    // estado de informação
    informationIds: info.informationIds,
    toggleInformation: info.toggleInformation,
    removeFromInformation: info.removeFromInformation,
    clearAllInformation: info.clearAllInformation,
    hasInformationItems: info.hasInformationItems,

    // seleção
    selectedItem,
    setSelectedItem: setSelectedItemGeneric,

    // tabela
    rowStateAccessor,
    movedIds,
    tableItems,
    proceedToWorking,
  } as const;
}
