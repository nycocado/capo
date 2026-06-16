import { CutListDto, PipeLengthDto } from "@/dtos";
import { PipeLengthWithContext } from "@/interfaces";
import { VALIDATION } from "@/constants";

/**
 * Extrai todos os pipe-lengths de todos os sheets de uma cut-list.
 *
 * @param cutList Cut-list com isometric e seus sheets.
 */
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

/**
 * Enriquece um pipe-length com o contexto do isométrico e da sheet a que pertence.
 *
 * @param pipeLength Pipe-length a enriquecer.
 * @param cutLists Cut-lists em que o pipe-length é buscado.
 * @returns Pipe-length com `isometricInfo`, ou `null` se não encontrado.
 */
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

/**
 * Enriquece uma lista de pipe-lengths com contexto do isométrico.
 * Pipe-lengths sem correspondência são retornados sem alteração.
 *
 * @param pipeLengths Pipe-lengths a enriquecer.
 * @param cutLists Cut-lists usadas como fonte do contexto.
 */
export const enrichPipeLengths = (
  pipeLengths: PipeLengthDto[],
  cutLists: CutListDto[],
): PipeLengthDto[] => {
  return pipeLengths.map((pipeLength) => {
    const enriched = enrichPipeLengthWithContext(pipeLength, cutLists);
    return enriched || pipeLength;
  });
};

/**
 * Valida o input de heat number: deve ser um inteiro >= HEAT_NUMBER_MIN.
 *
 * @param value String digitada pelo operador.
 */
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
