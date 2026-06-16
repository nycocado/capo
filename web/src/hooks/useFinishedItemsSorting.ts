import { useMemo } from "react";

// Hook genérico que expõe os itens "finished" para a ordenação (finished por último).
// ONLY uses backend states - frontend never determines finished status.
export const useFinishedItemsSorting = <T extends { id: number }>(
  items: T[],
  rowStateAccessor: (item: T) => string,
) => {
  // ONLY compute backend finished IDs - frontend never determines finished state
  const backendFinishedIds = useMemo(() => {
    return items
      .filter((item) => rowStateAccessor(item) === "finished")
      .map((item) => item.id);
  }, [items, rowStateAccessor]);

  return {
    allFinishedIds: backendFinishedIds, // Only backend determines finished state
    movedIds: backendFinishedIds,
  };
};
