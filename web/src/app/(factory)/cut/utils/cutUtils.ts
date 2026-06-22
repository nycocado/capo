import { CutListDto } from "@dtos";
import { PipeLengthWithContext } from "@interfaces";

export const extractPipeLengthsFromCutList = (
  cutList: CutListDto,
): PipeLengthWithContext[] => {
  const out: PipeLengthWithContext[] = [];
  const seen = new Set<number>();

  for (const spool of cutList.isometric.spools ?? []) {
    for (const joint of spool.joints ?? []) {
      for (const part of [joint.part1, joint.part2]) {
        if (
          part.type === "pipe_length" &&
          part.pipeLength &&
          !seen.has(part.id)
        ) {
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

export const validateHeatNumber = (value: string): boolean =>
  value.trim().length > 0;
