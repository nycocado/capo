import { WeldListDto } from "@/dtos";
import { WeldWithContext } from "@/interfaces";

/**
 * Extrai os welds de uma weld-list (spool→joints→welds), cada um com o spool de
 * contexto para o WorkGrid e o WorkPanel.
 *
 * @param weldList Weld-list com o spool e a sua hierarquia.
 * @returns Welds ordenados por id, ou array vazio se o spool estiver ausente.
 */
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
