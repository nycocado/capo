import { PipeLengthWithContext } from "@/interfaces";
import { CutListDto, PipeLengthDto } from "@/dtos";
import { TAB_TYPES, TabType } from "@components/features/WorkTabs";

/**
 * Anexa ao pipe-length selecionado o isometric/sheet a que pertence.
 *
 * @param selectedPipeLength Pipe-length atualmente selecionado.
 * @param cutLists Lista de cut-lists onde procurar o contexto.
 * @param activeTab Aba ativa — só enriquece na aba Working.
 * @returns O pipe-length enriquecido, ou null se não aplicável.
 */
function enrichPipeLength(
  selectedPipeLength: PipeLengthDto | null,
  cutLists: CutListDto[],
  activeTab: TabType,
): PipeLengthWithContext | null {
  if (!selectedPipeLength || activeTab !== TAB_TYPES.WORKING) return null;

  const targetId = selectedPipeLength.id;
  for (const cutList of cutLists) {
    const sheet = (cutList.isometric.sheets ?? []).find((s) =>
      s.pipeLengths?.some((pl) => pl.id === targetId),
    );
    if (sheet) {
      return {
        ...selectedPipeLength,
        isometricInfo: {
          internalId: cutList.isometric.internalId,
          sheetNumber: sheet.number,
        },
      };
    }
  }

  return null;
}

/**
 * Enriquece o pipe-length selecionado com o seu contexto de isometric/sheet.
 *
 * @param selectedPipeLength Pipe-length atualmente selecionado.
 * @param cutLists Cut-lists onde procurar o contexto.
 * @param activeTab Aba ativa — só enriquece na aba Working.
 * @returns O item enriquecido (ou null) sob a chave `enrichedSelectedItem`.
 */
export const usePipeLengthSelection = (
  selectedPipeLength: PipeLengthDto | null,
  cutLists: CutListDto[],
  activeTab: TabType,
) => {
  // Derivação pura em render: o React Compiler recusa memoizar este valor
  // (forma do loop com retorno aninhado), então não há useMemo a preservar.
  const enrichedSelectedItem = enrichPipeLength(
    selectedPipeLength,
    cutLists,
    activeTab,
  );

  return {
    enrichedSelectedItem,
  };
};
