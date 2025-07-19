import { useCallback } from "react";
import { TAB_TYPES, TabType } from "@components/features/WorkTabs";
import { WorkStatusDto } from "@/dtos";

// Generic work states (can be overridden by module constants)
export const DEFAULT_WORK_STATES = {
  TO_DO: "to-do",
  WORKING: "working",
  FINISHED: "finished",
  INFORMATION: "information",
} as const;

// Generic function to get state from workStatus
export const getWorkStatusState = (
  workStatus?: { name: string },
  workStates = DEFAULT_WORK_STATES,
): string => {
  if (!workStatus) return workStates.TO_DO;

  switch (workStatus.name.toLowerCase()) {
    case workStates.TO_DO:
      return workStates.TO_DO;
    case workStates.WORKING:
      return workStates.WORKING;
    case workStates.FINISHED:
      return workStates.FINISHED;
    default:
      return workStates.TO_DO;
  }
};

// Generic function to check user access to items - Fixed type compatibility
export const canUserAccessItem = <
  T extends { workStatus?: { name: string; createdBy?: number | null } },
>(
  item: T,
  currentUserId?: number,
  workStates = DEFAULT_WORK_STATES,
): boolean => {
  if (!currentUserId) return true; // Allow access if no user info

  const workStatus = getWorkStatusState(item.workStatus, workStates);
  if (workStatus !== workStates.WORKING) return true;

  // Check if working state was created by another user
  const createdBy = item.workStatus?.createdBy;
  return !createdBy || createdBy === currentUserId;
};

// Generic hook for status accessor
export const useWorkStatusAccessor = <
  T extends {
    id: number;
    workStatus?: WorkStatusDto;
  },
>(
  activeTab: TabType,
  informationIds: Set<number>,
  currentUserId?: number,
  workStates = DEFAULT_WORK_STATES,
) => {
  return useCallback(
    (item: T) => {
      // Information state takes priority
      if (informationIds.has(item.id)) {
        return workStates.INFORMATION;
      }

      // Check if user can access item (for ALL tab)
      if (activeTab === TAB_TYPES.ALL) {
        if (!canUserAccessItem(item, currentUserId, workStates)) {
          return "danger"; // Return danger state for restricted access
        }
      }

      // Use API state for items
      return getWorkStatusState(item.workStatus, workStates);
    },
    [activeTab, informationIds, currentUserId, workStates],
  );
};
