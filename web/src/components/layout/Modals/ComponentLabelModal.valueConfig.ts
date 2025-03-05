import {PipeLength} from "@models/pipe-length.interface";
import {ValueConfig} from "@components/layout/Modals/ComponentLabelModal.types";

export const cutCompletionModalConfig = (
    completedItem: PipeLength | null,
    heatNumbers: Record<number, string>
): { value: string, values: ValueConfig[] } => {
    if (!completedItem) return {value: '', values: []};

    const currentHeatNumber = heatNumbers[completedItem.id] || completedItem.heatNumber || '';

    return {
        value: completedItem.internalId,
        values: [
            {
                type: 'tagged',
                label: 'Length',
                value: completedItem.length ?? '\u00A0',
                tag: 'mm',
                onClick: () => {
                }
            },
            {
                type: 'normal',
                label: 'Isometric',
                value: completedItem.isometric?.internalId ?? '\u00A0',
                onClick: () => {
                }
            },
            {
                type: 'normal',
                label: 'Heat Number',
                value: currentHeatNumber || '\u00A0',
                onClick: () => {
                }
            }
        ]
    };
};