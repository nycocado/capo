import { useMemo } from "react";
import { Column } from "@components/features/WorkTable/WorkTable";
import { TabType } from "@components/features/WorkTabs";

// Generic function to sort finished items last
export const sortFinishedLast = <T extends { id: number }>(
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

// Generic function to filter by search using columns or simple field access
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

// Generic hook for row states configuration
export const useRowStates = <T>(
  activeTab: TabType,
  handleRowClick: (item: T) => void,
  customStates?: Record<string, any>,
) => {
  return useMemo(() => {
    return {
      initial: {
        className: "bg-secondary text-white",
        onClick: handleRowClick,
      },
      "to-do": {
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
        onClick: handleRowClick, // Always allow click, let the specific implementation decide
      },
      danger: {
        className: "bg-danger text-white",
        onClick: undefined,
      },
      ...customStates,
    };
  }, [activeTab, handleRowClick, customStates]);
};
