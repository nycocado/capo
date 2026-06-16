import { WeldListDto } from "@/dtos";
import { WeldWithContext } from "@/interfaces";

/**
 * Extrai os welds de uma weld-list, enriquecendo cada um com o `spoolInfo`
 * necessário para o WorkGrid e o WorkPanel.
 *
 * @param weldList Weld-list com spool e seus welds.
 * @returns Welds ordenados por id, ou array vazio se o spool estiver ausente.
 */
export const extractWeldsFromWeldList = (
  weldList: WeldListDto,
): WeldWithContext[] => {
  const welds: WeldWithContext[] = [];

  if (!weldList.spool) {
    console.warn("WeldList spool is undefined:", weldList);
    return welds;
  }

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

/**
 * Localiza o id do joint que contém o weld indicado dentro de uma weld-list.
 *
 * @param weldList Weld-list com spool e seus joints.
 * @param weldId Id do weld a localizar.
 * @returns Id do joint correspondente, ou `null` se não encontrado.
 */
export const findJointIdForWeld = (
  weldList: WeldListDto,
  weldId: number,
): number | null => {
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
