import { useCallback, type Dispatch, type SetStateAction } from "react";
import { CutListDto } from "@/dtos";
import { PipeLengthWithContext } from "@/interfaces";
import { TabType, TAB_TYPES } from "@components/features/WorkTabs";
import { isListAccessible, statusToUiState } from "@/hooks";
import { WORK_STATES } from "@/constants";

type CutRow = PipeLengthWithContext | CutListDto;

export interface UseCutTableCallbacks {
  onCutListSelected?: (cutList: CutListDto) => void;
  onCutListClaim?: (cutListId: number) => Promise<boolean>;
  onWorkingTransition?: (item: PipeLengthWithContext) => void;
  onItemCompleted?: (item: PipeLengthWithContext) => void;
}

export const useCutEventHandlers = (
  activeTab: TabType,
  informationIds: Set<number>,
  toggleInformation: (id: number) => void,
  clearAllInformation: () => void,
  hasInformationItems: () => boolean,
  rowStateAccessor: (item: CutRow) => string,
  setSelectedItem: Dispatch<SetStateAction<CutRow | null>>,
  items: CutRow[],
  callbacks?: UseCutTableCallbacks,
  currentUserId?: number,
) => {
  const handleRowClick = useCallback(
    (item: CutRow) => {
      const currentState = rowStateAccessor(item);

      if (activeTab === TAB_TYPES.ALL) {
        const cutList = item as CutListDto;

        if (currentState === "danger") return;

        if (currentState === WORK_STATES.TO_DO) {
          callbacks?.onCutListClaim?.(cutList.id);
          return;
        }
        if (
          currentState === WORK_STATES.WORKING &&
          isListAccessible(cutList, currentUserId)
        ) {
          callbacks?.onCutListSelected?.(cutList);
          return;
        }
        if (currentState === WORK_STATES.FINISHED) {
          callbacks?.onCutListSelected?.(cutList);
          return;
        }
      }

      if (activeTab === TAB_TYPES.WORKING) {
        const pipeLength = item as PipeLengthWithContext;

        const hasOtherInformation =
          hasInformationItems() && !informationIds.has(pipeLength.id);
        const hasOtherWorkingItems = items.some((i) => {
          if (i.id === pipeLength.id) return false;
          return (
            statusToUiState((i as PipeLengthWithContext).status) ===
            WORK_STATES.WORKING
          );
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
          toggleInformation(pipeLength.id);
          setSelectedItem(pipeLength);
          return;
        }
        if (currentState === WORK_STATES.INFORMATION) {
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

  const handleNextWorkflow = useCallback(() => {
    if (activeTab === TAB_TYPES.ALL) {
      const cutLists = items as CutListDto[];
      const workingCutList = cutLists.find(
        (cutList) =>
          rowStateAccessor(cutList) === WORK_STATES.WORKING &&
          isListAccessible(cutList, currentUserId),
      );
      if (workingCutList) {
        callbacks?.onCutListSelected?.(workingCutList);
        return;
      }
      const todoCutList = cutLists.find(
        (cutList) => rowStateAccessor(cutList) === WORK_STATES.TO_DO,
      );
      if (todoCutList) callbacks?.onCutListClaim?.(todoCutList.id);
      return;
    }

    if (activeTab === TAB_TYPES.WORKING) {
      const pipeLengths = items as PipeLengthWithContext[];
      const availableItems = pipeLengths.filter(
        (item) => statusToUiState(item.status) !== WORK_STATES.FINISHED,
      );
      if (availableItems.length === 0) return;

      const workingItem = availableItems.find(
        (item) => statusToUiState(item.status) === WORK_STATES.WORKING,
      );
      if (workingItem) return handleRowClick(workingItem);

      const infoItem = availableItems.find((item) =>
        informationIds.has(item.id),
      );
      if (infoItem) return handleRowClick(infoItem);

      const todoItem = availableItems.find(
        (item) => statusToUiState(item.status) === WORK_STATES.TO_DO,
      );
      if (todoItem) handleRowClick(todoItem);
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
    const pipeLengths = items as PipeLengthWithContext[];
    if (pipeLengths.length === 0) return false;
    return pipeLengths.every(
      (item) => statusToUiState(item.status) === WORK_STATES.FINISHED,
    );
  }, [activeTab, items]);

  const isItemInFocus = useCallback(
    (item: CutRow | null): boolean => {
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
