import React, { useCallback } from 'react';
import {
  getWorkStatusState,
  canUserAccessCutList,
} from './useWorkStatusAccessor';
import { WORK_STATES } from '../constants';
import { TAB_TYPES, type TabType } from '@components/features/factory/WorkTabs';
import { CutListDto, PipeLengthDto } from '@/dtos';

export interface UseCutTableCallbacks {
  onWorkingTransition?: (item: PipeLengthDto) => void;
  onItemCompleted?: (item: PipeLengthDto) => void;
  onCutListSelected?: (cutList: CutListDto) => void;
  onCutListSetWorking?: (cutListId: number) => Promise<boolean>;
}

export const useCutEventHandlers = (
  activeTab: TabType,
  informationIds: Set<number>,
  toggleInformation: (id: number) => void,
  clearAllInformation: () => void,
  hasInformationItems: () => boolean,
  rowStateAccessor: (item: PipeLengthDto | CutListDto) => string,
  setSelectedItem: React.Dispatch<
    React.SetStateAction<(PipeLengthDto | CutListDto) | null>
  >,
  items: (PipeLengthDto | CutListDto)[],
  callbacks?: UseCutTableCallbacks,
  currentUserId?: number,
) => {
  // Handle work click for WORKING tab items
  const handleWorkClick = useCallback(
    (item: PipeLengthDto | CutListDto) => {
      if (activeTab !== TAB_TYPES.WORKING) return;

      const pipeLength = item as PipeLengthDto;
      const currentState = rowStateAccessor(item);

      // Block if other items are active
      const hasOtherInformation =
        hasInformationItems() && !informationIds.has(item.id);
      const hasWorkingItems = items.some((i) => {
        if (i.id === item.id) return false;
        const itemWorkStatus = (i as PipeLengthDto).workStatus;
        const apiState = getWorkStatusState(itemWorkStatus);
        return apiState === WORK_STATES.WORKING;
      });

      if (
        (hasOtherInformation || hasWorkingItems) &&
        currentState !== WORK_STATES.FINISHED &&
        currentState !== WORK_STATES.INFORMATION
      ) {
        return;
      }

      // State transitions
      if (currentState === WORK_STATES.TO_DO) {
        clearAllInformation();
        toggleInformation(item.id);
        setSelectedItem(item);
        return;
      }

      if (currentState === WORK_STATES.INFORMATION) {
        callbacks?.onWorkingTransition?.(pipeLength);
        return;
      }

      if (currentState === WORK_STATES.WORKING) {
        callbacks?.onItemCompleted?.(pipeLength);
        return;
      }

      setSelectedItem(item);
    },
    [
      activeTab,
      rowStateAccessor,
      informationIds,
      hasInformationItems,
      toggleInformation,
      clearAllInformation,
      setSelectedItem,
      callbacks,
      items,
    ],
  );

  // Handle row clicks based on active tab
  const handleRowClick = useCallback(
    (item: PipeLengthDto | CutListDto) => {
      if (activeTab === TAB_TYPES.ALL) {
        const cutList = item as CutListDto;
        const currentState = rowStateAccessor(cutList);

        // Block access if cut list is restricted
        if (currentState === 'danger') {
          return; // Do nothing for restricted cut lists
        }

        // Handle set-working for to-do cut lists
        if (currentState === WORK_STATES.TO_DO) {
          callbacks?.onCutListSetWorking?.(cutList.id);
          return;
        }

        // Only allow selection of working cut lists by current user
        if (
          currentState === WORK_STATES.WORKING &&
          canUserAccessCutList(cutList, currentUserId)
        ) {
          callbacks?.onCutListSelected?.(cutList);
          return;
        }
      }

      if (activeTab === TAB_TYPES.WORKING) {
        const currentState = rowStateAccessor(item);

        // Block if working items exist and current item cannot be interacted with
        const hasWorkingItems = items.some((i) => {
          if (i.id === item.id) return false;
          const itemWorkStatus = (i as PipeLengthDto).workStatus;
          const apiState = getWorkStatusState(itemWorkStatus);
          return apiState === WORK_STATES.WORKING;
        });

        if (
          hasWorkingItems &&
          currentState !== WORK_STATES.FINISHED &&
          currentState !== WORK_STATES.INFORMATION
        ) {
          return;
        }

        // Handle state transitions
        if (currentState === WORK_STATES.TO_DO) {
          clearAllInformation();
          toggleInformation(item.id);
          setSelectedItem(item);
          return;
        }

        if (currentState === WORK_STATES.INFORMATION) {
          callbacks?.onWorkingTransition?.(item as PipeLengthDto);
          return;
        }

        if (currentState === WORK_STATES.WORKING) {
          callbacks?.onItemCompleted?.(item as PipeLengthDto);
          return;
        }

        if (currentState === WORK_STATES.FINISHED) {
          setSelectedItem(item);
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
    ],
  );

  // Navigate to next available item
  const handleNextWorkflow = useCallback(() => {
    if (activeTab === TAB_TYPES.ALL) {
      const todoCutList = (items as CutListDto[]).find((cutList) => {
        const currentState = rowStateAccessor(cutList);
        return currentState === WORK_STATES.TO_DO; // Only accessible to-do items
      });

      if (todoCutList) {
        callbacks?.onCutListSetWorking?.(todoCutList.id);
      }
      return;
    }

    if (activeTab === TAB_TYPES.WORKING) {
      const pipeLengths = items as PipeLengthDto[];
      const availableItems = pipeLengths.filter((item) => {
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
        handleWorkClick(workingItem);
        return;
      }

      const infoItem = availableItems.find((item) =>
        informationIds.has(item.id),
      );
      if (infoItem) {
        handleWorkClick(infoItem);
        return;
      }

      const todoItem = availableItems.find((item) => {
        const apiState = getWorkStatusState(item.workStatus);
        return apiState === WORK_STATES.TO_DO;
      });

      if (todoItem) {
        handleWorkClick(todoItem);
      }
    }
  }, [activeTab, items, informationIds, handleWorkClick, callbacks]);

  // Check if all working items are finished
  const areAllWorkingItemsFinished = useCallback(() => {
    if (activeTab !== TAB_TYPES.WORKING) return false;

    const pipeLengths = items as PipeLengthDto[];
    if (pipeLengths.length === 0) return false;

    return pipeLengths.every((item) => {
      const apiState = getWorkStatusState(item.workStatus);
      return apiState === WORK_STATES.FINISHED;
    });
  }, [activeTab, items]);

  // Check if item can appear in panel
  const isItemInFocus = useCallback(
    (item: PipeLengthDto | CutListDto | null): boolean => {
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
    handleWorkClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  };
};
