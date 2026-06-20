import { useMemo } from "react";

export const useFinishedItemsSorting = <T extends { id: number }>(
  items: T[],
  rowStateAccessor: (item: T) => string,
) => {
  const backendFinishedIds = useMemo(() => {
    return items
      .filter((item) => rowStateAccessor(item) === "finished")
      .map((item) => item.id);
  }, [items, rowStateAccessor]);

  return {
    allFinishedIds: backendFinishedIds,
    movedIds: backendFinishedIds,
  };
};
