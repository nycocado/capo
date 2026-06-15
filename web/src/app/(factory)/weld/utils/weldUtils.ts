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

// Mescla um weld atualizado na weld-list a que pertence (spool.welds),
// retornando novas weld-lists — reflete no cache o resultado do step de um weld
// sem depender do evento WebSocket (stepar um weld intermediário não emite
// updateWorkStatus da weld-list). O contexto `spoolInfo` é descartado.
export const mergeWeldIntoWeldLists = (
  weldLists: WeldListDto[],
  weld: WeldWithContext,
): WeldListDto[] => {
  const { spoolInfo: _spoolInfo, ...plain } = weld;
  return weldLists.map((weldList) => {
    const owns = weldList.spool?.welds?.some((w) => w.id === weld.id);
    if (!owns) return weldList;
    return {
      ...weldList,
      spool: {
        ...weldList.spool,
        welds: weldList.spool.welds?.map((w) =>
          w.id === weld.id ? { ...w, ...plain } : w,
        ),
      },
    };
  });
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
