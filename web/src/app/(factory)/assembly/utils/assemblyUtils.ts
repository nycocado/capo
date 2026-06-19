import { AssemblyListDto } from "@/dtos";
import { WeldWithContext } from "@/interfaces";

/**
 * Extrai os welds de uma assembly-list (spools→joints→welds), cada um com o
 * spool de contexto para o WorkGrid.
 *
 * @param assemblyList Assembly-list com o isométrico e a sua hierarquia.
 */
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

/**
 * Localiza o id do joint que contém o weld indicado (spools→joints→welds).
 *
 * @param assemblyList Assembly-list onde procurar.
 * @param weldId Id do weld.
 */
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
