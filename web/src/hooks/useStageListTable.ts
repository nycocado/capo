import { useCallback } from "react";
import { Column } from "@components/features/WorkTable/WorkTable";
import { TAB_TYPES } from "@components/features/WorkTabs";
import { WORK_STATES } from "@constants";
import { useWorkTableBase, ListLike } from "./useWorkTableBase";
import { useRowStates } from "./useTableUtils";
import { isListAccessible } from "./useWorkStatusAccessor";

export interface StageListCallbacks<T> {
  onSelected?: (item: T) => void;
  onClaim?: (id: number) => Promise<boolean>;
}

export interface UseStageListTableParams<T> {
  items: T[];
  search: string;
  searchField?: string;
  columns: Column<T>[];
  currentUserId?: number;
  callbacks?: StageListCallbacks<T>;
}

export function useStageListTable<T extends ListLike>({
  items,
  search,
  searchField = "id",
  columns,
  currentUserId,
  callbacks,
}: UseStageListTableParams<T>) {
  const { tableItems, rowStateAccessor, selectedItem, clearAllInformation } =
    useWorkTableBase<T>({
      items,
      activeTab: TAB_TYPES.ALL,
      search,
      searchField,
      columns,
      currentUserId,
    });

  const handleRowClick = useCallback(
    (item: T) => {
      if (rowStateAccessor(item) === "danger") return;
      callbacks?.onSelected?.(item);
    },
    [rowStateAccessor, callbacks],
  );

  const handleNextWorkflow = useCallback(() => {
    const working = items.find(
      (item) =>
        rowStateAccessor(item) === WORK_STATES.WORKING &&
        isListAccessible(item, currentUserId),
    );
    if (working) {
      callbacks?.onSelected?.(working);
      return;
    }
    const todo = items.find(
      (item) => rowStateAccessor(item) === WORK_STATES.TO_DO,
    );
    if (todo) callbacks?.onClaim?.(todo.id);
  }, [items, callbacks, rowStateAccessor, currentUserId]);

  const rowStates = useRowStates(TAB_TYPES.ALL, handleRowClick);

  return {
    tableItems,
    rowStates,
    rowStateAccessor,
    selectedItem,
    handleRowClick,
    handleNextWorkflow,
    clearAllInformation,
  };
}
