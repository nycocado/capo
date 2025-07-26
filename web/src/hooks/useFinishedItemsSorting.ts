import { useState, useEffect, useMemo } from "react";

// Generic timing constants that can be overridden
export const DEFAULT_TIMING = {
  MOVE_DELAY: 1500,
} as const;

// Generic hook to manage finished items sorting with visual feedback
// ONLY uses backend states - frontend never determines finished status
export const useFinishedItemsSorting = <T extends { id: number }>(
  items: T[],
  rowStateAccessor: (item: T) => string,
  timing = DEFAULT_TIMING,
) => {
  const [movedIds, setMovedIds] = useState<number[]>([]);

  // ONLY compute backend finished IDs - frontend never determines finished state
  const backendFinishedIds = useMemo(() => {
    return items
      .filter((item) => rowStateAccessor(item) === "finished")
      .map((item) => item.id);
  }, [items, rowStateAccessor]);

  // Move backend finished items immediately
  useEffect(() => {
    setMovedIds((prev) => {
      const newIds = backendFinishedIds.filter((id) => !prev.includes(id));
      return newIds.length > 0 ? [...prev, ...newIds] : prev;
    });
  }, [backendFinishedIds]);

  return {
    allFinishedIds: backendFinishedIds, // Only backend determines finished state
    movedIds,
    resetMovedIds: () => setMovedIds([]),
  };
};
