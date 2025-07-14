import { PipeLengthDto } from '@interfaces/pipe-length.dto';
import { ValueConfig } from '@components/layout/Modals/ComponentLabelModal.types';

export const cutCompletionModalConfig = (
  completedItem: PipeLengthDto | null,
): { value: string; values: ValueConfig[] } => {
  if (!completedItem) return { value: '', values: [] };

  return {
    value: completedItem.internalId,
    values: [
      {
        type: 'tagged',
        label: 'Length',
        value: completedItem.length?.toString() ?? '\u00A0',
        tag: 'mm',
        onClick: () => {},
      },
      {
        type: 'normal',
        label: 'Material',
        value: completedItem.material?.name ?? '\u00A0',
        onClick: () => {},
      },
      {
        type: 'normal',
        label: 'Heat Number',
        value: completedItem.heatNumber?.toString() ?? '\u00A0',
        onClick: () => {},
      },
    ],
  };
};
