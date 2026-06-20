import { WeldListDto } from "@/dtos";
import { WeldWithContext } from "@/interfaces";

export const extractWeldsFromWeldList = (
  weldList: WeldListDto,
): WeldWithContext[] => {
  const welds: WeldWithContext[] = [];
  if (!weldList.spool) return welds;

  for (const joint of weldList.spool.joints ?? []) {
    for (const weld of joint.welds ?? []) {
      welds.push({
        ...weld,
        spoolInfo: { internalId: weldList.spool.internalId },
      });
    }
  }

  return welds.sort((a, b) => a.id - b.id);
};
