import React, { useState, useMemo, useCallback } from 'react';
import { useCutState } from './useCutState';
import { useWorkStatusAccessor } from './useWorkStatusAccessor';
import {
  useCutEventHandlers,
  UseCutTableCallbacks,
} from './useCutEventHandlers';
import { useFinishedItemsSorting } from './useFinishedItemsSorting';
import {
  useRowStates,
  sortFinishedLast,
  filterBySearch,
} from './useTableUtils';
import { TAB_TYPES } from '@components/features/factory/WorkTabs';
import { CutListDto, PipeLengthDto } from '@/dtos';

/**
 * Hook for CutList table (ALL tab)
 */
export function useCutListTable(
  cutLists: CutListDto[],
  search: string,
  currentUserId?: number,
  callbacks?: Pick<
    UseCutTableCallbacks,
    'onCutListSelected' | 'onCutListSetWorking'
  >,
) {
  // Information overlay state management
  const {
    informationIds,
    toggleInformation,
    removeFromInformation,
    clearAllInformation,
    hasInformationItems,
  } = useCutState();

  // Selected item state
  const [selectedItem, setSelectedItem] = useState<CutListDto | null>(null);

  // Work status accessor
  const rowStateAccessor = useWorkStatusAccessor(
    TAB_TYPES.ALL,
    informationIds,
    currentUserId,
  );

  // Finished items sorting
  const { movedIds } = useFinishedItemsSorting(cutLists, [], rowStateAccessor);

  // Type-safe wrapper for setSelectedItem
  const setSelectedItemGeneric = useCallback(
    (value: React.SetStateAction<(PipeLengthDto | CutListDto) | null>) => {
      if (typeof value === 'function') {
        setSelectedItem((prev) => {
          const result = value(prev);
          return result as CutListDto | null;
        });
      } else {
        setSelectedItem(value as CutListDto | null);
      }
    },
    [],
  );

  // Event handlers
  const {
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
  } = useCutEventHandlers(
    TAB_TYPES.ALL,
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
    rowStateAccessor,
    setSelectedItemGeneric,
    cutLists,
    callbacks,
    currentUserId,
  );

  // Row states configuration
  const rowStates = useRowStates(TAB_TYPES.ALL, handleRowClick);

  // Computed table items
  const tableItems = useMemo(() => {
    const sortedItems = sortFinishedLast(cutLists, movedIds);
    return filterBySearch(sortedItems, search);
  }, [cutLists, movedIds, search]);

  return {
    tableItems,
    rowStates,
    rowStateAccessor,
    selectedItem,
    handleRowClick,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
    clearAllInformation,
  };
}
