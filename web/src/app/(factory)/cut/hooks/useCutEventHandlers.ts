import React, { useCallback } from "react";
import { CutListDto, PipeLengthDto } from "@/dtos";
import { TabType, TAB_TYPES } from "@components/features/WorkTabs";
import { getWorkStatusState, canUserAccessItem } from "@/hooks";
import { WORK_STATES } from "@/constants";

// Interface for callbacks específica para Cut
export interface UseCutTableCallbacks {
  onCutListSelected?: (cutList: CutListDto) => void;
  onCutListSetWorking?: (cutListId: number) => Promise<boolean>;
  onWorkingTransition?: (item: PipeLengthDto) => void;
  onItemCompleted?: (item: PipeLengthDto) => void;
}

// Hook for handling cut events - implementação baseada no assembly
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
  // Handle row clicks based on active tab
  const handleRowClick = useCallback(
    (item: PipeLengthDto | CutListDto) => {
      const currentState = rowStateAccessor(item);

      if (activeTab === TAB_TYPES.ALL) {
        const cutList = item as CutListDto;

        // Block access if cut list is restricted
        if (currentState === "danger") {
          return; // Do nothing for restricted cut lists
        }

        // FLUXO CUT: TO_DO → Material Verification → Working state → Tab Working
        if (currentState === WORK_STATES.TO_DO) {
          callbacks?.onCutListSetWorking?.(cutList.id);
          return;
        }

        // WORKING → Material Verification → Tab Working
        if (
          currentState === WORK_STATES.WORKING &&
          canUserAccessItem(cutList, currentUserId)
        ) {
          callbacks?.onCutListSelected?.(cutList);
          return;
        }

        // Para outros estados (FINISHED), apenas selecionar
        if (currentState === WORK_STATES.FINISHED) {
          callbacks?.onCutListSelected?.(cutList);
          return;
        }
      }

      if (activeTab === TAB_TYPES.WORKING) {
        const pipeLength = item as PipeLengthDto;

        // Block if other information items exist
        const hasOtherInformation =
          hasInformationItems() && !informationIds.has(pipeLength.id);

        // Block if other working items exist
        const hasOtherWorkingItems = items.some((i) => {
          if (i.id === pipeLength.id) return false;
          const apiState = getWorkStatusState((i as PipeLengthDto).workStatus);
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
          toggleInformation(pipeLength.id);
          setSelectedItem(pipeLength);
          return;
        }

        if (currentState === WORK_STATES.INFORMATION) {
          // Remove from information and trigger working transition
          clearAllInformation();
          callbacks?.onWorkingTransition?.(pipeLength);
          return;
        }

        if (currentState === WORK_STATES.WORKING) {
          callbacks?.onItemCompleted?.(pipeLength);
          return;
        }

        if (currentState === WORK_STATES.FINISHED) {
          setSelectedItem(pipeLength);
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
      // PRIORIDADE: WORKING primeiro, depois TO_DO
      const workingCutList = (items as CutListDto[]).find((cutList) => {
        const currentState = rowStateAccessor(cutList);
        return (
          currentState === WORK_STATES.WORKING &&
          canUserAccessItem(cutList, currentUserId)
        );
      });

      if (workingCutList) {
        callbacks?.onCutListSelected?.(workingCutList);
        return;
      }

      // Se não há WORKING, busca TO_DO
      const todoCutList = (items as CutListDto[]).find((cutList) => {
        const currentState = rowStateAccessor(cutList);
        return currentState === WORK_STATES.TO_DO;
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
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  };
};
