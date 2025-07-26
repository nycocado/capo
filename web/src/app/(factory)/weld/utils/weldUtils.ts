import { WeldListDto } from "@/dtos";
import { WeldWithContext } from "@/interfaces";

export const extractWeldsFromWeldList = (
  weldList: WeldListDto,
): WeldWithContext[] => {
  const welds: WeldWithContext[] = [];

  // Verificação de segurança: se não há spool, retorna array vazio
  if (!weldList.spool) {
    console.warn("WeldList spool is undefined:", weldList);
    return welds;
  }

  // Extrair soldas diretas do spool (estrutura real da API)
  weldList.spool.welds?.forEach((weld) => {
    welds.push({
      ...weld,
      spoolInfo: {
        internalId: weldList.spool.internalId,
      },
    });
  });

  return welds.sort((a, b) => a.id - b.id);
};

export const extractWeldsFromWeldListArray = (
  weldLists: WeldListDto[],
): WeldWithContext[] => {
  const allWelds: WeldWithContext[] = [];

  weldLists.forEach((weldList) => {
    const welds = extractWeldsFromWeldList(weldList);
    allWelds.push(...welds);
  });

  return allWelds.sort((a, b) => a.id - b.id);
};

export const findJointIdForWeld = (
  weldList: WeldListDto,
  weldId: number,
): number | null => {
  // Verificação de segurança
  if (!weldList.spool) {
    return null;
  }

  for (const joint of weldList.spool.joints || []) {
    const hasWeld = joint.welds?.some((w) => w.id === weldId);
    if (hasWeld) {
      return joint.id;
    }
  }
  return null;
};
