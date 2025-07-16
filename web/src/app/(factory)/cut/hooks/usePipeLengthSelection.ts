import { useMemo } from "react";
import { PipeLengthWithContext } from "@/interfaces";
import { CutListDto, PipeLengthDto } from "@/dtos";
import { TAB_TYPES, TabType } from "@components/features/WorkTabs";

// Hook to select and enrich pipe length
export const usePipeLengthSelection = (
  selectedPipeLength: PipeLengthDto | null,
  cutLists: CutListDto[],
  activeTab: TabType,
) => {
  // Enriched selected item
  const enrichedSelectedItem: PipeLengthWithContext | null = useMemo(() => {
    if (!selectedPipeLength || activeTab !== TAB_TYPES.WORKING) return null;

    // Find isometric and sheet for this pipe length
    for (const cutList of cutLists) {
      for (const sheet of cutList.isometric.sheets || []) {
        if (sheet.pipeLengths?.some((pl) => pl.id === selectedPipeLength.id)) {
          return {
            ...selectedPipeLength,
            isometricInfo: {
              internalId: cutList.isometric.internalId,
              sheetNumber: sheet.number,
            },
          };
        }
      }
    }

    return null;
  }, [selectedPipeLength, cutLists, activeTab]);

  return {
    enrichedSelectedItem,
  };
};
