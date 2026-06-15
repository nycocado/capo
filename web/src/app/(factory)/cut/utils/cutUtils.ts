import { CutListDto, PipeLengthDto } from "@/dtos";
import { PipeLengthWithContext } from "@/interfaces";
import { VALIDATION } from "@/constants";

// Extract pipe lengths from cut list
export const extractPipeLengthsFromCutList = (
  cutList: CutListDto,
): PipeLengthDto[] => {
  const pipeLengths: PipeLengthDto[] = [];
  cutList.isometric.sheets?.forEach((sheet) => {
    sheet.pipeLengths?.forEach((pipeLength) => {
      pipeLengths.push(pipeLength);
    });
  });
  return pipeLengths;
};

// Enrich single pipe length with context
export const enrichPipeLengthWithContext = (
  pipeLength: PipeLengthDto,
  cutLists: CutListDto[],
): PipeLengthWithContext | null => {
  for (const cutList of cutLists) {
    for (const sheet of cutList.isometric.sheets || []) {
      if (sheet.pipeLengths?.some((pl) => pl.id === pipeLength.id)) {
        return {
          ...pipeLength,
          isometricInfo: {
            internalId: cutList.isometric.internalId,
            sheetNumber: sheet.number,
          },
        };
      }
    }
  }
  return null;
};

// Enrich multiple pipe lengths
export const enrichPipeLengths = (
  pipeLengths: PipeLengthDto[],
  cutLists: CutListDto[],
): PipeLengthDto[] => {
  return pipeLengths.map((pipeLength) => {
    const enriched = enrichPipeLengthWithContext(pipeLength, cutLists);
    return enriched || pipeLength;
  });
};

// Validate heat number input
export const validateHeatNumber = (value: string): boolean => {
  const num = parseInt(value);
  return !isNaN(num) && num >= VALIDATION.HEAT_NUMBER_MIN;
};

// Substitui um pipe-length na sheet a que pertence, retornando novas cut-lists —
// reflete no cache o resultado de um step sem depender do evento WebSocket.
export const mergePipeLengthIntoCutLists = (
  cutLists: CutListDto[],
  pipeLength: PipeLengthDto,
): CutListDto[] =>
  cutLists.map((cutList) => {
    const sheets = cutList.isometric.sheets ?? [];
    const owns = sheets.some((sheet) =>
      sheet.pipeLengths?.some((pl) => pl.id === pipeLength.id),
    );
    if (!owns) return cutList;
    return {
      ...cutList,
      isometric: {
        ...cutList.isometric,
        sheets: sheets.map((sheet) => ({
          ...sheet,
          pipeLengths: sheet.pipeLengths?.map((pl) =>
            pl.id === pipeLength.id ? pipeLength : pl,
          ),
        })),
      },
    };
  });
