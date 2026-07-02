import { useCallback } from "react";
import { isListAccessible } from "@hooks";
import { TAB_TYPES, type TabType } from "@components/features/WorkTabs";
import { WeldListDto } from "@dtos";
import { WORK_STATES } from "@constants";

export interface UseWeldTableCallbacks {
  onWeldListSelected?: (weldList: WeldListDto) => void;
  onWeldListClaim?: (weldListId: number) => Promise<boolean>;
}

export const useWeldEventHandlers = (
  activeTab: TabType,
  rowStateAccessor: (item: WeldListDto) => string,
  items: WeldListDto[],
  callbacks?: UseWeldTableCallbacks,
  currentUserId?: number,
) => {
  const handleRowClick = useCallback(
    (item: WeldListDto) => {
      if (activeTab !== TAB_TYPES.ALL) return;
      if (rowStateAccessor(item) === "danger") return;
      callbacks?.onWeldListSelected?.(item);
    },
    [activeTab, rowStateAccessor, callbacks],
  );

  const handleNextWorkflow = useCallback(() => {
    if (activeTab !== TAB_TYPES.ALL) return;
    const working = items.find(
      (wl) =>
        rowStateAccessor(wl) === WORK_STATES.WORKING &&
        isListAccessible(wl, currentUserId),
    );
    if (working) {
      callbacks?.onWeldListSelected?.(working);
      return;
    }
    const todo = items.find((wl) => rowStateAccessor(wl) === WORK_STATES.TO_DO);
    if (todo) callbacks?.onWeldListClaim?.(todo.id);
  }, [activeTab, items, callbacks, rowStateAccessor, currentUserId]);

  return {
    handleRowClick,
    handleNextWorkflow,
  };
};
