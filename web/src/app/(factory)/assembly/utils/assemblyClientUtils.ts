import { AssemblyListDto } from "@/dtos";
import { WeldWithContext } from "@/interfaces";

export const extractWeldsFromAssemblyList = (
  assemblyList: AssemblyListDto,
  sheetNumber?: number,
): WeldWithContext[] => {
  const welds: WeldWithContext[] = [];

  const sheets = sheetNumber
    ? assemblyList.isometric?.sheets?.filter((s) => s.number === sheetNumber) ||
      []
    : assemblyList.isometric?.sheets || [];

  sheets.forEach((sheet) => {
    sheet.spools?.forEach((spool) => {
      spool.joints?.forEach((joint) => {
        joint.welds?.forEach((weld) => {
          welds.push({
            ...weld,
            spool: {
              internalId: spool.internalId,
            },
          });
        });
      });
    });
  });

  return welds.sort((a, b) => a.id - b.id);
};

export const findJointIdForWeld = (
  assemblyList: AssemblyListDto,
  weldId: number,
): number | null => {
  for (const sheet of assemblyList.isometric?.sheets || []) {
    for (const spool of sheet.spools || []) {
      for (const joint of spool.joints || []) {
        const hasWeld = joint.welds?.some((w) => w.id === weldId);
        if (hasWeld) {
          return joint.id;
        }
      }
    }
  }
  return null;
};

export const getAvailableSheets = (assemblyList: AssemblyListDto | null) => {
  return assemblyList?.isometric?.sheets || [];
};
