import { CutListDto, PipeLengthDto } from '@/dtos';
import {
  useCutEventHandlers,
  UseCutTableCallbacks,
} from '@/app/(factory)/cut/hooks/useCutEventHandlers';
import { useCutState } from '@/app/(factory)/cut/hooks/useCutState';
import React, { useCallback, useMemo, useState } from 'react';
import { useWorkStatusAccessor } from '@/app/(factory)/cut/hooks/useWorkStatusAccessor';
import { TAB_TYPES } from '@components/features/factory/WorkTabs';
import { useFinishedItemsSorting } from '@/app/(factory)/cut/hooks/useFinishedItemsSorting';
import {
  filterBySearch,
  sortFinishedLast,
  useRowStates,
} from '@/app/(factory)/cut/hooks/useTableUtils';

// Hook for PipeLength table (WORKING tab)
export function usePipeLengthTable(
  pipeLengths: PipeLengthDto[],
  search: string,
  callbacks?: Pick<
    UseCutTableCallbacks,
    'onWorkingTransition' | 'onItemCompleted'
  >,
) {
  const {
    informationIds,
    toggleInformation,
    removeFromInformation,
    clearAllInformation,
    hasInformationItems,
  } = useCutState();

  const [selectedItem, setSelectedItem] = useState<PipeLengthDto | null>(null);
  const rowStateAccessor = useWorkStatusAccessor(
    TAB_TYPES.WORKING,
    informationIds,
  );
  const { movedIds } = useFinishedItemsSorting(
    pipeLengths,
    [],
    rowStateAccessor,
  );

  // Type-safe wrapper for setSelectedItem
  const setSelectedItemGeneric = useCallback(
    (value: React.SetStateAction<(PipeLengthDto | CutListDto) | null>) => {
      if (typeof value === 'function') {
        setSelectedItem((prev) => {
          const result = value(prev);
          return result as PipeLengthDto | null;
        });
      } else {
        setSelectedItem(value as PipeLengthDto | null);
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
    TAB_TYPES.WORKING,
    informationIds,
    toggleInformation,
    clearAllInformation,
    hasInformationItems,
    rowStateAccessor,
    setSelectedItemGeneric,
    pipeLengths,
    callbacks,
  );

  // Row states configuration
  const rowStates = useRowStates(TAB_TYPES.WORKING, handleRowClick);

  // Computed table items
  const tableItems = useMemo(() => {
    const sortedItems = sortFinishedLast(pipeLengths, movedIds);
    return filterBySearch(sortedItems, search);
  }, [pipeLengths, movedIds, search]);

  // Handle item transition to working state
  const proceedToWorking = (id: number) => {
    removeFromInformation(id);
    const item = pipeLengths.find((i) => i.id === id);
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
