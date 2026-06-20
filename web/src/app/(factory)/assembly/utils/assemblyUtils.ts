import { AssemblyListDto } from "@/dtos";
import { WeldWithContext } from "@/interfaces";

export const extractWeldsFromAssemblyList = (
  assemblyList: AssemblyListDto,
): WeldWithContext[] => {
  const welds: WeldWithContext[] = [];
  for (const spool of assemblyList.isometric.spools ?? []) {
    for (const joint of spool.joints ?? []) {
      for (const weld of joint.welds ?? []) {
        welds.push({ ...weld, spoolInfo: { internalId: spool.internalId } });
      }
    }
  }
  return welds.sort((a, b) => a.id - b.id);
};

export const findJointIdForWeld = (
  assemblyList: AssemblyListDto,
  weldId: number,
): number | null => {
  for (const spool of assemblyList.isometric.spools ?? []) {
    for (const joint of spool.joints ?? []) {
      if (joint.welds?.some((w) => w.id === weldId)) return joint.id;
    }
  }
  return null;
};
