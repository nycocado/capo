import { useState, useEffect, useMemo } from "react";

// Generic timing constants that can be overridden
export const DEFAULT_TIMING = {
  MOVE_DELAY: 1500,
} as const;

// Generic hook to manage finished items sorting with visual feedback
export const useFinishedItemsSorting = <T extends { id: number }>(
  items: T[],
  finishedIds: number[],
  rowStateAccessor: (item: T) => string,
  timing = DEFAULT_TIMING,
) => {
  const [movedIds, setMovedIds] = useState<number[]>([]);

  // Compute backend finished IDs
  const backendFinishedIds = useMemo(() => {
    return items
      .filter((item) => rowStateAccessor(item) === "finished")
      .map((item) => item.id);
  }, [items, rowStateAccessor]);

  // Combine all finished IDs
  const allFinishedIds = useMemo(() => {
    return [...new Set([...finishedIds, ...backendFinishedIds])];
  }, [finishedIds, backendFinishedIds]);

  // Move backend finished items immediately
  useEffect(() => {
    setMovedIds((prev) => {
      const newIds = backendFinishedIds.filter((id) => !prev.includes(id));
      return newIds.length > 0 ? [...prev, ...newIds] : prev;
    });
  }, [backendFinishedIds]);

  // Move frontend finished items with delay
  useEffect(() => {
    const newIds = finishedIds.filter((id) => !movedIds.includes(id));
    if (newIds.length === 0) return;

    const timer = setTimeout(() => {
      setMovedIds((prev) => [...prev, ...newIds]);
    }, timing.MOVE_DELAY);

    return () => clearTimeout(timer);
  }, [finishedIds, movedIds, timing.MOVE_DELAY]);

  return {
    allFinishedIds,
    movedIds,
    setMovedIds,
  };
};
