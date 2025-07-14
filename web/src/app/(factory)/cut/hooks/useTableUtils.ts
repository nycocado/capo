import { CutListDto, PipeLengthDto } from '@/dtos';
import { TAB_TYPES, TabType } from '@components/features/factory/WorkTabs';
import { useMemo } from 'react';

// Sort finished items to end of list
export const sortFinishedLast = (
  items: (PipeLengthDto | CutListDto)[],
  finishedIds: number[],
): (PipeLengthDto | CutListDto)[] => {
  return [...items].sort((a, b) => {
    const aFinished = finishedIds.includes(a.id);
    const bFinished = finishedIds.includes(b.id);
    if (aFinished && !bFinished) return 1;
    if (!aFinished && bFinished) return -1;
    return 0;
  });
};

// Filter items by search term
export const filterBySearch = (
  items: (PipeLengthDto | CutListDto)[],
  search: string,
): (PipeLengthDto | CutListDto)[] => {
  const searchTerm = search.replace(/^0+/, '');
  return items.filter((item) => item.id.toString().includes(searchTerm));
};

// Row state configurations for table
export const useRowStates = (
  activeTab: TabType,
  handleRowClick: (item: PipeLengthDto | CutListDto) => void,
) => {
  return useMemo(() => {
    const baseStates = {
      initial: {
        className: 'bg-dark text-white',
        onClick: handleRowClick,
      },
      information: {
        className: 'bg-tertiary text-white',
        onClick: handleRowClick,
      },
      working: {
        className: 'bg-primary text-white',
        onClick: handleRowClick,
      },
      finished: {
        className: 'bg-success text-white',
        onClick: handleRowClick,
      },
      danger: {
        className: 'bg-danger text-white',
        // No onClick for danger state - blocks interaction
      },
    };

    // All tab: disable working state clicks for security
    if (activeTab === TAB_TYPES.ALL) {
      return {
        ...baseStates,
        working: { className: 'bg-primary text-white' },
        finished: { className: 'bg-success text-white' },
      };
    }

    // Working tab: all states clickable except danger
    return baseStates;
  }, [activeTab, handleRowClick]);
};
