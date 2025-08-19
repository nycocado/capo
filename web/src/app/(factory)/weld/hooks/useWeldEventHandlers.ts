import React, { useCallback } from "react";
import { getWorkStatusState, canUserAccessItem } from "@/hooks";
import { TAB_TYPES, type TabType } from "@components/features/WorkTabs";
import { WeldListDto } from "@/dtos";
import { WORK_STATES } from "@/constants";

export interface UseWeldTableCallbacks {
  onWeldListSelected?: (weldList: WeldListDto) => void;
  onWeldListSetWorking?: (weldListId: number) => Promise<boolean>;
}

export const useWeldEventHandlers = (
  activeTab: TabType,
  informationIds: Set<number>,
  toggleInformation: (id: number) => void,
  clearAllInformation: () => void,
  hasInformationItems: () => boolean,
  rowStateAccessor: (item: WeldListDto) => string,
  setSelectedItem: React.Dispatch<React.SetStateAction<WeldListDto | null>>,
  items: WeldListDto[],
  callbacks?: UseWeldTableCallbacks,
  currentUserId?: number,
) => {
  // Handle row clicks based on active tab
  const handleRowClick = useCallback(
    (item: WeldListDto) => {
      const currentState = rowStateAccessor(item);

      if (activeTab === TAB_TYPES.ALL) {
        // Block access if weld list is restricted
        if (currentState === "danger") {
          return; // Do nothing for restricted weld lists
        }

        // FLUXO WELD: Qualquer clique na tab ALL deve carregar as soldas
        // Independente do estado (to-do, working, finished)
        callbacks?.onWeldListSelected?.(item);
        return;
      }

      if (activeTab === TAB_TYPES.WORKING) {
        // Block if other information items exist
        const hasOtherInformation =
          hasInformationItems() && !informationIds.has(item.id);

        // Block if other working items exist
        const hasOtherWorkingItems = items.some((i) => {
          if (i.id === item.id) return false;
          const apiState = getWorkStatusState(i.workStatus);
          return apiState === WORK_STATES.WORKING;
        });

        if (
          (hasOtherInformation || hasOtherWorkingItems) &&
          currentState !== WORK_STATES.FINISHED &&
          currentState !== WORK_STATES.INFORMATION
        ) {
          return; // Block interaction
        }

        // Handle state transitions in WORKING tab
        if (currentState === WORK_STATES.TO_DO) {
          clearAllInformation();
          toggleInformation(item.id);
          setSelectedItem(item);
          return;
        }

        if (currentState === WORK_STATES.INFORMATION) {
          // Remove from information and trigger material verification
          clearAllInformation();
          callbacks?.onWeldListSelected?.(item);
          return;
        }

        if (currentState === WORK_STATES.WORKING) {
          setSelectedItem(item);
          callbacks?.onWeldListSelected?.(item);
          return;
        }

        if (currentState === WORK_STATES.FINISHED) {
          setSelectedItem(item);
          callbacks?.onWeldListSelected?.(item);
          return;
        }
      }
    },
    [
      activeTab,
      rowStateAccessor,
      callbacks,
      clearAllInformation,
      toggleInformation,
      setSelectedItem,
      items,
      currentUserId,
      hasInformationItems,
      informationIds,
    ],
  );

  // Navigate to next available item
  const handleNextWorkflow = useCallback(() => {
    if (activeTab === TAB_TYPES.ALL) {
      // Priority: working > to-do
      const workingWeldList = items.find((weldList) => {
        const currentState = rowStateAccessor(weldList);
        return (
          currentState === WORK_STATES.WORKING &&
          canUserAccessItem(weldList, currentUserId)
        );
      });

      if (workingWeldList) {
        callbacks?.onWeldListSelected?.(workingWeldList);
        return;
      }

      const todoWeldList = items.find((weldList) => {
        const currentState = rowStateAccessor(weldList);
        return currentState === WORK_STATES.TO_DO;
      });

      if (todoWeldList) {
        callbacks?.onWeldListSetWorking?.(todoWeldList.id);
      }
      return;
    }

    if (activeTab === TAB_TYPES.WORKING) {
      const availableItems = items.filter((item) => {
        const apiState = getWorkStatusState(item.workStatus);
        return apiState !== WORK_STATES.FINISHED;
      });

      if (availableItems.length === 0) return;

      // Priority: working > information > to-do
      const workingItem = availableItems.find((item) => {
        const apiState = getWorkStatusState(item.workStatus);
        return apiState === WORK_STATES.WORKING;
      });

      if (workingItem) {
        handleRowClick(workingItem);
        return;
      }

      const infoItem = availableItems.find((item) =>
        informationIds.has(item.id),
      );
      if (infoItem) {
        handleRowClick(infoItem);
        return;
      }

      const todoItem = availableItems.find((item) => {
        const apiState = getWorkStatusState(item.workStatus);
        return apiState === WORK_STATES.TO_DO;
      });

      if (todoItem) {
        handleRowClick(todoItem);
      }
    }
  }, [
    activeTab,
    items,
    informationIds,
    handleRowClick,
    callbacks,
    rowStateAccessor,
    currentUserId,
  ]);

  // Check if all working items are finished
  const areAllWorkingItemsFinished = useCallback(() => {
    if (activeTab !== TAB_TYPES.WORKING) return false;

    if (items.length === 0) return false;

    return items.every((item) => {
      const apiState = getWorkStatusState(item.workStatus);
      return apiState === WORK_STATES.FINISHED;
    });
  }, [activeTab, items]);

  // Check if item can appear in panel
  const isItemInFocus = useCallback(
    (item: WeldListDto | null): boolean => {
      if (!item) return false;

      const state = rowStateAccessor(item);
      return (
        state === WORK_STATES.INFORMATION ||
        state === WORK_STATES.WORKING ||
        state === WORK_STATES.FINISHED
      );
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
