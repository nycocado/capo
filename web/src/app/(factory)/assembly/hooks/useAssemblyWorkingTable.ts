import React, { useState, useMemo, useCallback } from 'react';
import { useAssemblyState } from './useAssemblyState';
import { useWorkStatusAccessor } from './useWorkStatusAccessor';
import {
  useAssemblyEventHandlers,
  UseAssemblyTableCallbacks,
} from './useAssemblyEventHandlers';
import { useFinishedItemsSorting } from './useFinishedItemsSorting';
import {
  useRowStates,
  sortFinishedLast,
  filterBySearch,
} from './useTableUtils';
import { TAB_TYPES } from '@components/features/factory/WorkTabs';
import { AssemblyListDto } from '@/dtos';

// Hook for Assembly working table (WORKING tab)
export function useAssemblyWorkingTable(
  workingAssemblyLists: AssemblyListDto[],
  search: string,
  callbacks?: Pick<UseAssemblyTableCallbacks, 'onAssemblyListSelected'>,
) {
  const {
    informationIds,
    toggleInformation,
    removeFromInformation,
    clearAllInformation,
    hasInformationItems,
  } = useAssemblyState();

  const [selectedItem, setSelectedItem] = useState<AssemblyListDto | null>(null);
  const rowStateAccessor = useWorkStatusAccessor(
    TAB_TYPES.WORKING,
    informationIds,
  );
  const { movedIds } = useFinishedItemsSorting(
    workingAssemblyLists,
    [],
    rowStateAccessor,
  );

  // Type-safe wrapper for setSelectedItem
  const setSelectedItemGeneric = useCallback(
    (value: React.SetStateAction<AssemblyListDto | null>) => {
      if (typeof value === 'function') {
        setSelectedItem((prev) => {
          const result = value(prev);
          return result as AssemblyListDto | null;
        });
      } else {
        setSelectedItem(value as AssemblyListDto | null);
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
  } = useAssemblyEventHandlers(
    TAB_TYPES.WORKING,
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
    rowStateAccessor,
    setSelectedItemGeneric,
    workingAssemblyLists,
    callbacks,
  );

  // Row states configuration
  const rowStates = useRowStates(TAB_TYPES.WORKING, handleRowClick);

  // Computed table items
  const tableItems = useMemo(() => {
    const sortedItems = sortFinishedLast(workingAssemblyLists, movedIds);
    return filterBySearch(sortedItems, search);
  }, [workingAssemblyLists, movedIds, search]);

  // Handle item transition to working state
  const proceedToWorking = (id: number) => {
    removeFromInformation(id);
    const item = workingAssemblyLists.find((i) => i.id === id);
    if (item) {
      setSelectedItem(item);
    }
  };

  return {
    tableItems,
    rowStates,
    rowStateAccessor,
    selectedItem,
    handleRowClick,
    proceedToWorking,
    handleNextWorkflow,
    areAllWorkingItemsFinished,
    isItemInFocus,
    clearAllInformation,
  };
}
