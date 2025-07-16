import { useState, useEffect, useMemo } from "react";
import { TIMING } from "../constants";
import { CutListDto, PipeLengthDto } from "@/dtos";

// Hook to manage finished items sorting with visual feedback
export const useFinishedItemsSorting = (
  items: (PipeLengthDto | CutListDto)[],
  finishedIds: number[],
  rowStateAccessor: (item: PipeLengthDto | CutListDto) => string,
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

  // Move locally finished items with delay for visual feedback
  useEffect(() => {
    const timeouts: NodeJS.Timeout[] = [];
    const locallyFinished = finishedIds.filter(
      (id) => !backendFinishedIds.includes(id) && !movedIds.includes(id),
    );
    locallyFinished.forEach((id) => {
      timeouts.push(
        setTimeout(
          () => setMovedIds((prev) => [...prev, id]),
          TIMING.FINISHED_MOVE_DELAY,
        ),
      );
    });
    return () => timeouts.forEach(clearTimeout);
  }, [finishedIds, backendFinishedIds, movedIds]);

  return { movedIds, allFinishedIds };
};
