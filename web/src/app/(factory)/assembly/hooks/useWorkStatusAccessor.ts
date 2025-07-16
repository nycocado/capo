import { WORK_STATES } from "../constants";
import { TAB_TYPES, TabType } from "@components/features/factory/WorkTabs";
import { useCallback } from "react";
import { AssemblyListDto } from "@/dtos";

// Get work state from API workStatus
export const getWorkStatusState = (workStatus?: { name: string }): string => {
  if (!workStatus) return WORK_STATES.TO_DO;

  switch (workStatus.name.toLowerCase()) {
    case WORK_STATES.TO_DO:
      return WORK_STATES.TO_DO;
    case WORK_STATES.WORKING:
      return WORK_STATES.WORKING;
    case WORK_STATES.FINISHED:
      return WORK_STATES.FINISHED;
    default:
      return WORK_STATES.TO_DO;
  }
};

// Check if user can access an assembly list
export const canUserAccessAssemblyList = (
  assemblyList: AssemblyListDto,
  currentUserId?: number,
): boolean => {
  if (!currentUserId) return true; // Allow access if no user info

  const workStatus = getWorkStatusState(assemblyList.workStatus);
  if (workStatus !== WORK_STATES.WORKING) return true;

  // Check if working state was created by another user
  const createdBy = assemblyList.workStatus?.createdBy;
  return !createdBy || createdBy === currentUserId;
};

export const useWorkStatusAccessor = (
  activeTab: TabType,
  informationIds: Set<number>,
  currentUserId?: number,
) => {
  return useCallback(
    (item: AssemblyListDto) => {
      // Information state takes priority
      if (informationIds.has(item.id)) {
        return WORK_STATES.INFORMATION;
      }

      // Check if user can access assembly list (for ALL tab)
      if (activeTab === TAB_TYPES.ALL) {
        if (!canUserAccessAssemblyList(item, currentUserId)) {
          return "danger"; // Return danger state for restricted access
        }
      }

      // Use API state for assembly lists
      return getWorkStatusState(item.workStatus);
    },
    [activeTab, informationIds, currentUserId],
  );
};
