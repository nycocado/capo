import { useState, useEffect, useMemo } from "react";
import { TIMING } from "../constants";
import { AssemblyListDto } from "@/dtos";

// Manage finished items sorting with visual feedback
export const useFinishedItemsSorting = (
  items: AssemblyListDto[],
  finishedIds: number[],
  rowStateAccessor: (item: AssemblyListDto) => string,
) => {
  const [movedIds, setMovedIds] = useState<number[]>([]);

  const backendFinishedIds = useMemo(() => {
    return items
      .filter((item) => rowStateAccessor(item) === "finished")
      .map((item) => item.id);
  }, [items, rowStateAccessor]);

  const allFinishedIds = useMemo(() => {
    return [...new Set([...finishedIds, ...backendFinishedIds])];
  }, [finishedIds, backendFinishedIds]);

  // Move backend finished items immediately
  useEffect(() => {
    if (backendFinishedIds.length > 0) {
      setMovedIds((prev) => {
        const newIds = backendFinishedIds.filter((id) => !prev.includes(id));
        return newIds.length > 0 ? [...prev, ...newIds] : prev;
      });
    }
  }, [backendFinishedIds]);

  // Move locally finished items with delay for visual feedback
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    const locallyFinishedIds = finishedIds.filter(
      (id) => !backendFinishedIds.includes(id),
    );

    locallyFinishedIds.forEach((id) => {
      if (!movedIds.includes(id)) {
        const timeout = setTimeout(() => {
          setMovedIds((prev) => [...prev, id]);
        }, TIMING.FINISHED_MOVE_DELAY);
        timeouts.push(timeout);
      }
    });

    return () => timeouts.forEach(clearTimeout);
  }, [finishedIds, backendFinishedIds, movedIds]);

  return { movedIds, allFinishedIds };
};
