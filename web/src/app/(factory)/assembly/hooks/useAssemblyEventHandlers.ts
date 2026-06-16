import React, { useCallback } from "react";
import { getWorkStatusState, canUserAccessItem } from "@/hooks";
import { TAB_TYPES, type TabType } from "@components/features/WorkTabs";
import { AssemblyListDto } from "@/dtos";
import { WORK_STATES } from "@/constants";

export interface UseAssemblyTableCallbacks {
  onAssemblyListSelected?: (assemblyList: AssemblyListDto) => void;
  onAssemblyListSetWorking?: (assemblyListId: number) => Promise<boolean>;
}

/**
 * Produz os handlers de interação da tabela de montagem: clique em linha,
 * avanço para o próximo item, verificação de conclusão e foco no painel.
 */
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
  const handleRowClick = useCallback(
    (item: AssemblyListDto) => {
      const currentState = rowStateAccessor(item);

      if (activeTab === TAB_TYPES.ALL) {
        if (currentState === "danger") return;

        // FLUXO ASSEMBLY: TO_DO ou WORKING → Material Verification → Tab Working
        if (
          currentState === WORK_STATES.TO_DO ||
          currentState === WORK_STATES.WORKING
        ) {
          callbacks?.onAssemblyListSelected?.(item);
          return;
        }

        if (currentState === WORK_STATES.FINISHED) {
          callbacks?.onAssemblyListSelected?.(item);
          return;
        }
      }

      if (activeTab === TAB_TYPES.WORKING) {
        const hasOtherInformation =
          hasInformationItems() && !informationIds.has(item.id);

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
          return;
        }

        if (currentState === WORK_STATES.TO_DO) {
          clearAllInformation();
          toggleInformation(item.id);
          setSelectedItem(item);
          return;
        }

        if (currentState === WORK_STATES.INFORMATION) {
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
      hasInformationItems,
      informationIds,
    ],
  );

  const handleNextWorkflow = useCallback(() => {
    if (activeTab === TAB_TYPES.ALL) {
      // PRIORIDADE: WORKING primeiro, depois TO_DO
      const workingAssemblyList = items.find((assemblyList) => {
        const currentState = rowStateAccessor(assemblyList);
        return (
          currentState === WORK_STATES.WORKING &&
          canUserAccessItem(assemblyList, currentUserId)
        );
      });

      if (workingAssemblyList) {
        callbacks?.onAssemblyListSelected?.(workingAssemblyList);
        return;
      }

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

      // Prioridade: working > information > to-do
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

  const areAllWorkingItemsFinished = useCallback(() => {
    if (activeTab !== TAB_TYPES.WORKING) return false;

    if (items.length === 0) return false;

    return items.every((item) => {
      const apiState = getWorkStatusState(item.workStatus);
      return apiState === WORK_STATES.FINISHED;
    });
  }, [activeTab, items]);

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
