import { WORK_STATES } from "@/app/(factory)/cut/constants";
import { TAB_TYPES, TabType } from "@components/features/factory/WorkTabs";
import { useCallback } from "react";
import { CutListDto, PipeLengthDto } from "@/dtos";

// Get state from workStatus
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

// Check user access to cut list
export const canUserAccessCutList = (
  cutList: CutListDto,
  currentUserId?: number,
): boolean => {
  if (!currentUserId) return true; // Allow access if no user info

  const workStatus = getWorkStatusState(cutList.workStatus);
  if (workStatus !== WORK_STATES.WORKING) return true;

  // Check if working state was created by another user
  const createdBy = cutList.workStatus?.createdBy;
  return !createdBy || createdBy === currentUserId;
};

// Hook for status accessor
export const useWorkStatusAccessor = (
  activeTab: TabType,
  informationIds: Set<number>,
  currentUserId?: number,
) => {
  return useCallback(
    (item: PipeLengthDto | CutListDto) => {
      // Information state takes priority
      if (informationIds.has(item.id)) {
        return WORK_STATES.INFORMATION;
      }

      // Check if user can access cut list (for ALL tab)
      if (activeTab === TAB_TYPES.ALL) {
        const cutList = item as CutListDto;
        if (!canUserAccessCutList(cutList, currentUserId)) {
          return "danger"; // Return danger state for restricted access
        }
      }

      // Use API state for both tabs
      if (activeTab === TAB_TYPES.ALL) {
        return getWorkStatusState((item as CutListDto).workStatus);
      } else {
        return getWorkStatusState((item as PipeLengthDto).workStatus);
      }
    },
    [activeTab, informationIds, currentUserId],
  );
};
