import { useMemo } from 'react';
import { TAB_TYPES, type TabType } from '@components/features/factory/WorkTabs';
import { PipeLengthWithContext } from '@/interfaces';
import { CutListDto, PipeLengthDto } from '@/dtos';

// Hook to manage pipe length selection and enrichment
export const usePipeLengthSelection = (
  selectedPipeLength: PipeLengthDto | null,
  cutLists: CutListDto[],
  activeTab: TabType,
) => {
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
