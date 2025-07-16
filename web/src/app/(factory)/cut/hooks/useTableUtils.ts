import { CutListDto, PipeLengthDto } from "@/dtos";
import { useMemo } from "react";
import { Column } from "@components/features/WorkTable/WorkTable";
import { TAB_TYPES, TabType } from "@components/features/WorkTabs";

// Sort finished items last
export const sortFinishedLast = <T extends PipeLengthDto | CutListDto>(
  items: T[],
  finishedIds: number[],
): T[] => {
  return [...items].sort((a, b) => {
    const aFinished = finishedIds.includes(a.id);
    const bFinished = finishedIds.includes(b.id);
    if (aFinished && !bFinished) return 1;
    if (!aFinished && bFinished) return -1;
    return 0;
  });
};

// Filter by search using columns
export const filterBySearch = <T extends { [key: string]: any }>(
  items: T[],
  search: string,
  searchField: string = "id",
  columns?: Column<T>[],
): T[] => {
  if (!search) return items;
  const lowerSearch = search.toLowerCase();
  const column = columns?.find((col) => col.id === searchField);
  return items.filter((item) => {
    let value: any;
    if (column) {
      value =
        typeof column.accessor === "function"
          ? column.accessor(item)
          : item[column.accessor as keyof T];
    } else {
      value = searchField.split(".").reduce((obj, key) => obj?.[key], item);
    }
    return value?.toString().toLowerCase().includes(lowerSearch);
  });
};

// Hook for row states
export const useRowStates = (
  activeTab: TabType,
  handleRowClick: (item: PipeLengthDto | CutListDto) => void,
) => {
  return useMemo(() => {
    const baseStates = {
      initial: {
        className: "bg-dark text-white",
        onClick: handleRowClick,
      },
      information: {
        className: "bg-tertiary text-white",
        onClick: handleRowClick,
      },
      working: {
        className: "bg-primary text-white",
        onClick: handleRowClick,
      },
      finished: {
        className: "bg-success text-white",
        onClick: handleRowClick,
      },
      danger: {
        className: "bg-danger text-white",
        // No onClick for danger state - blocks interaction
      },
    };

    // All tab: disable working state clicks for security
    if (activeTab === TAB_TYPES.ALL) {
      return {
        ...baseStates,
        working: { className: "bg-primary text-white" },
        finished: { className: "bg-success text-white" },
      };
    }

    // Working tab: all states clickable except danger
    return baseStates;
  }, [activeTab, handleRowClick]);
};
