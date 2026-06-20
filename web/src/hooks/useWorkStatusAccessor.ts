import { useCallback } from "react";
import { WORK_STATES } from "@/constants";

export const statusToUiState = (status?: string): string => {
  switch (status) {
    case "in_progress":
      return WORK_STATES.WORKING;
    case "done":
      return WORK_STATES.FINISHED;
    default:
      return WORK_STATES.TO_DO;
  }
};

export const isListAccessible = (
  list: { claimedBy?: { id: number } | null },
  currentUserId?: number,
): boolean =>
  !list.claimedBy || !currentUserId || list.claimedBy.id === currentUserId;

export const listToUiState = (
  list: { progress?: string; claimedBy?: { id: number } | null },
  currentUserId?: number,
): string => {
  if (!isListAccessible(list, currentUserId)) return "danger";
  return statusToUiState(list.progress);
};

export const useWorkStatusAccessor = <T extends { id: number }>(
  informationIds: Set<number>,
  resolveRawState: (item: T) => string,
) =>
  useCallback(
    (item: T) =>
      informationIds.has(item.id)
        ? WORK_STATES.INFORMATION
        : resolveRawState(item),
    [informationIds, resolveRawState],
  );
