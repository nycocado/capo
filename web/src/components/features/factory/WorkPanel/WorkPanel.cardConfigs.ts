import {CardConfig} from "./WorkPanel.types";
import {PipeLength} from "@models/pipe-length.interface";
import {WeldRow} from "@/app/(factory)/weld/useWeldTable.types";
import {WeldItemWithSpool} from "@/app/(factory)/weld/useWeldTable.types";

export interface CutCardHandlers {
    onHeatNumberClick?: () => void;
}

export interface WeldCardHandlers {
    onWPSClick?: () => void;
    onFillerClick?: () => void;
}

export const cutCardConfigs = (
    selectedItem: PipeLength | null,
    handlers?: CutCardHandlers
): CardConfig[] => [
    {
        items: [
            {type: 'tagged', label: 'Dimension', value: selectedItem?.length ?? '\u00A0', tag: 'mm'},
            {
                type: 'double',
                label: 'Diameter (DN)',
                primaryValue: selectedItem?.diameter.nominalMm ?? '\u00A0',
                primaryTag: 'mm',
                secondaryValue: selectedItem?.diameter.nominalInch ?? '\u00A0',
                secondaryTag: 'inch'
            },
        ],
    },
    {
        items: [
            {type: 'normal', label: 'ID', value: selectedItem?.internalId ?? '\u00A0'},
            {
                type: 'normal',
                label: 'Heat Number',
                value: selectedItem?.heatNumber ?? '\u00A0',
                onClick: handlers?.onHeatNumberClick
            },
        ],
    },
    {
        items: [
            {type: 'normal', label: 'Isometric', value: selectedItem?.isometric.internalId ?? '\u00A0'},
            {
                type: 'normal',
                label: 'Sheet',
                value: selectedItem?.isometric.sheet.map(s => s.number).join(', ') ?? '\u00A0'
            },
        ],
    },
    {
        items: [
            {type: 'tagged', label: 'Thickness', value: selectedItem?.thickness ?? '\u00A0', tag: 'mm'},
            {type: 'normal', label: 'Material', value: selectedItem?.material.name ?? '\u00A0'},
        ],
    },
];

export const weldCardConfigs = (
    selectedRow: WeldRow | null,
    selectedWeld: null | WeldItemWithSpool,
    handlers?: WeldCardHandlers
): CardConfig[] => [
    {
        items: [
            {
                type: 'normal',
                label: 'Spool',
                value: selectedRow?.spoolInternalId ?? '\u00A0'
            },
            {
                type: 'normal',
                label: 'TPI',
                value: selectedWeld?.wps?.tpi?.toString() ?? '\u00A0'
            },
        ],
    },
    {
        items: [
            {
                type: 'normal',
                label: 'Isometric',
                value: selectedRow?.isoInternalId ?? '\u00A0'
            },
            {
                type: 'normal',
                label: 'Sheet',
                value: selectedRow?.sheetNumber?.toString() ?? '\u00A0'
            },
        ],
    },
    {
        items: [
            {
                type: 'normal',
                label: 'WPS',
                value: selectedWeld?.wps?.internalId ?? selectedWeld?.wps?.document ?? selectedWeld?.wps?.id?.toString() ?? '\u00A0',
                onClick: handlers?.onWPSClick
            },
            {
                type: 'normal',
                label: 'Filler Material',
                value: selectedWeld?.filler?.name ?? selectedWeld?.filler?.id?.toString() ?? '\u00A0',
                onClick: handlers?.onFillerClick
            },
        ],
    },
];