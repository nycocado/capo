import { CutListDto } from "@/dtos";
import { PipeLengthWithContext } from "@/interfaces";

/**
 * Extrai os pipe-lengths de uma cut-list (percorrendo spools→joints→parts),
 * já enriquecidos com `id` (= id do part) e o contexto do isométrico. Cada
 * pipe-length aparece uma única vez.
 *
 * @param cutList Cut-list com o isométrico e a sua hierarquia.
 */
export const extractPipeLengthsFromCutList = (
  cutList: CutListDto,
): PipeLengthWithContext[] => {
  const out: PipeLengthWithContext[] = [];
  const seen = new Set<number>();

  for (const spool of cutList.isometric.spools ?? []) {
    for (const joint of spool.joints ?? []) {
      for (const part of [joint.part1, joint.part2]) {
        if (part.type === "pipe_length" && part.pipeLength && !seen.has(part.id)) {
          seen.add(part.id);
          out.push({
            ...part.pipeLength,
            id: part.id,
            isometricInfo: { internalId: cutList.isometric.internalId },
          });
        }
      }
    }
  }

  return out;
};

/** Valida o input de heat number: tem de ser um rótulo não vazio. */
export const validateHeatNumber = (value: string): boolean =>
  value.trim().length > 0;
