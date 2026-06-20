import { useMemo } from "react";
import { Column } from "@components/features/WorkTable/WorkTable";
import { RowStateConfig } from "@components/features/WorkTable/WorkTableRow";
import { TabType } from "@components/features/WorkTabs";

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

export const filterBySearch = <T>(
  items: T[],
  search: string,
  searchField: string = "id",
  columns?: Column<T>[],
): T[] => {
  if (!search) return items;
  const lowerSearch = search.toLowerCase();
  const column = columns?.find((col) => col.id === searchField);

  return items.filter((item) => {
    let value: unknown;
    if (column) {
      value =
        typeof column.accessor === "function"
          ? column.accessor(item)
          : item[column.accessor];
    } else {
      value = searchField
        .split(".")
        .reduce<unknown>(
          (obj, key) => (obj as Record<string, unknown> | undefined)?.[key],
          item,
        );
    }
    return String(value ?? "")
      .toLowerCase()
      .includes(lowerSearch);
  });
};

export const useRowStates = <T>(
  activeTab: TabType,
  handleRowClick: (item: T) => void,
  customStates?: Record<string, RowStateConfig<T>>,
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
        onClick: handleRowClick,
      },
      danger: {
        className: "bg-danger text-white",
        onClick: undefined,
      },
      ...customStates,
    };
  }, [handleRowClick, customStates]);
};
