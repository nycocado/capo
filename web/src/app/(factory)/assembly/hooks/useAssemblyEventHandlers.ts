import { useCallback } from "react";
import { isListAccessible } from "@/hooks";
import { TAB_TYPES, type TabType } from "@components/features/WorkTabs";
import { AssemblyListDto } from "@/dtos";
import { WORK_STATES } from "@/constants";

export interface UseAssemblyTableCallbacks {
  onAssemblyListSelected?: (assemblyList: AssemblyListDto) => void;
  onAssemblyListClaim?: (assemblyListId: number) => Promise<boolean>;
}

export const useAssemblyEventHandlers = (
  activeTab: TabType,
  rowStateAccessor: (item: AssemblyListDto) => string,
  items: AssemblyListDto[],
  callbacks?: UseAssemblyTableCallbacks,
  currentUserId?: number,
) => {
  const handleRowClick = useCallback(
    (item: AssemblyListDto) => {
      if (activeTab !== TAB_TYPES.ALL) return;
      if (rowStateAccessor(item) === "danger") return;
      callbacks?.onAssemblyListSelected?.(item);
    },
    [activeTab, rowStateAccessor, callbacks],
  );

  const handleNextWorkflow = useCallback(() => {
    if (activeTab !== TAB_TYPES.ALL) return;
    const working = items.find(
      (al) =>
        rowStateAccessor(al) === WORK_STATES.WORKING &&
        isListAccessible(al, currentUserId),
    );
    if (working) {
      callbacks?.onAssemblyListSelected?.(working);
      return;
    }
    const todo = items.find((al) => rowStateAccessor(al) === WORK_STATES.TO_DO);
    if (todo) callbacks?.onAssemblyListClaim?.(todo.id);
  }, [activeTab, items, callbacks, rowStateAccessor, currentUserId]);

  const areAllWorkingItemsFinished = useCallback(() => false, []);

  const isItemInFocus = useCallback(
    (item: AssemblyListDto | null): boolean => {
      if (!item) return false;
      const state = rowStateAccessor(item);
      return state === WORK_STATES.WORKING || state === WORK_STATES.FINISHED;
    },
    [rowStateAccessor],
  );

  return {
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  };
};
