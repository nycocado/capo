import React, { useCallback } from 'react';
import {
  getWorkStatusState,
  canUserAccessAssemblyList,
} from './useWorkStatusAccessor';
import { WORK_STATES } from '../constants';
import { TAB_TYPES, type TabType } from '@components/features/factory/WorkTabs';
import { AssemblyListDto } from '@/dtos';

export interface UseAssemblyTableCallbacks {
  onAssemblyListSelected?: (assemblyList: AssemblyListDto) => void;
  onAssemblyListSetWorking?: (assemblyListId: number) => Promise<boolean>;
}

export const useAssemblyEventHandlers = (
  activeTab: TabType,
  informationIds: Set<number>,
  toggleInformation: (id: number) => void,
  clearAllInformation: () => void,
  hasInformationItems: () => boolean,
  rowStateAccessor: (item: AssemblyListDto) => string,
  setSelectedItem: React.Dispatch<React.SetStateAction<AssemblyListDto | null>>,
  items: AssemblyListDto[],
  callbacks?: UseAssemblyTableCallbacks,
  currentUserId?: number,
) => {
  // Handle row clicks based on active tab
  const handleRowClick = useCallback(
    (item: AssemblyListDto) => {
      const currentState = rowStateAccessor(item);

      if (activeTab === TAB_TYPES.ALL) {
        // Block access if assembly list is restricted
        if (currentState === 'danger') {
          return; // Do nothing for restricted assembly lists
        }

        // FLUXO CORRETO: Qualquer clique na tab ALL deve iniciar material verification
        // Independente do estado (to-do, working, finished)
        callbacks?.onAssemblyListSelected?.(item);
        return;
      }

      if (activeTab === TAB_TYPES.WORKING) {
        // Block if other information items exist
        const hasOtherInformation = hasInformationItems() && !informationIds.has(item.id);

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
          callbacks?.onAssemblyListSelected?.(item);
          return;
        }

        if (currentState === WORK_STATES.WORKING) {
          setSelectedItem(item);
          callbacks?.onAssemblyListSelected?.(item);
          return;
        }

        if (currentState === WORK_STATES.FINISHED) {
          setSelectedItem(item);
          callbacks?.onAssemblyListSelected?.(item);
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
      const todoAssemblyList = items.find((assemblyList) => {
        const currentState = rowStateAccessor(assemblyList);
        return currentState === WORK_STATES.TO_DO;
      });

      if (todoAssemblyList) {
        callbacks?.onAssemblyListSetWorking?.(todoAssemblyList.id);
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
    (item: AssemblyListDto | null): boolean => {
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
