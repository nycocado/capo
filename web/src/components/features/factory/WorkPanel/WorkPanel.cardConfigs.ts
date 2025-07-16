import { CardConfig } from "./WorkPanel.types";
import { PipeLengthWithContext } from "@/interfaces";
import { WeldRow } from "@/app/(factory)/weld/useWeldTable.types";
import { WeldItemWithSpool } from "@/app/(factory)/weld/useWeldTable.types";
import { AssemblyListDto } from "@/dtos";

export interface CutCardHandlers {
  onHeatNumberClick?: () => void;
}

export interface WeldCardHandlers {
  onWPSClick?: () => void;
  onFillerClick?: () => void;
}

export interface AssemblyCardHandlers {
  onIsometricClick?: () => void;
}

export const cutCardConfigs = (
  selectedItem: PipeLengthWithContext | null,
  handlers?: CutCardHandlers,
): CardConfig[] => {
  return [
    {
      items: [
        {
          type: "tagged",
          label: "Length",
          value: selectedItem?.length?.toString() ?? "\u00A0",
          tag: "mm",
        },
        {
          type: "double",
          label: "Diameter (DN)",
          primaryValue:
            selectedItem?.diameter?.nominalMm?.toString() ?? "\u00A0",
          primaryTag: "mm",
          secondaryValue: selectedItem?.diameter?.nominalInch ?? "\u00A0",
          secondaryTag: "inch",
        },
      ],
    },
    {
      items: [
        {
          type: "normal",
          label: "ID",
          value: selectedItem?.internalId ?? "\u00A0",
        },
        {
          type: "normal",
          label: "Heat Number",
          value: selectedItem?.heatNumber ?? "\u00A0",
          onClick: handlers?.onHeatNumberClick,
        },
      ],
    },
    {
      items: [
        {
          type: "normal",
          label: "Isometric",
          value: selectedItem?.isometricInfo?.internalId ?? "\u00A0",
        },
        {
          type: "normal",
          label: "Sheet",
          value:
            selectedItem?.isometricInfo?.sheetNumber?.toString() ?? "\u00A0",
        },
      ],
    },
    {
      items: [
        {
          type: "normal",
          label: "Material",
          value: selectedItem?.material?.name ?? "\u00A0",
        },
        {
          type: "tagged",
          label: "Thickness",
          value: selectedItem?.thickness?.toString() ?? "\u00A0",
          tag: "mm",
        },
      ],
    },
  ];
};

export const assemblyCardConfigs = (
  selectedItem: AssemblyListDto | null,
  handlers?: AssemblyCardHandlers,
): CardConfig[] => {
  return [
    {
      items: [
        {
          type: "normal",
          label: "Assembly List",
          value: selectedItem?.internalId ?? "\u00A0",
        },
        {
          type: "normal",
          label: "Isometric",
          value: selectedItem?.isometric?.internalId ?? "\u00A0",
          onClick: handlers?.onIsometricClick,
        },
      ],
    },
    {
      items: [
        {
          type: "normal",
          label: "Sheets",
          value:
            selectedItem?.isometric?.sheets?.map((s) => s.number).join(", ") ??
            "\u00A0",
        },
        {
          type: "normal",
          label: "Total Spools",
          value:
            selectedItem?.isometric?.sheets
              ?.reduce((total, sheet) => {
                return total + (sheet.spools?.length || 0);
              }, 0)
              ?.toString() ?? "\u00A0",
        },
      ],
    },
  ];
};

export const weldCardConfigs = (
  selectedRow: WeldRow | null,
  selectedWeld: null | WeldItemWithSpool,
  handlers?: WeldCardHandlers,
): CardConfig[] => [
  {
    items: [
      {
        type: "normal",
        label: "Spool",
        value: selectedRow?.spoolInternalId ?? "\u00A0",
      },
      {
        type: "normal",
        label: "TPI",
        value: selectedWeld?.wps?.tpi?.toString() ?? "\u00A0",
      },
    ],
  },
  {
    items: [
      {
        type: "normal",
        label: "Isometric",
        value: selectedRow?.isoInternalId ?? "\u00A0",
      },
      {
        type: "normal",
        label: "Sheet",
        value: selectedRow?.sheetNumber?.toString() ?? "\u00A0",
      },
    ],
  },
  {
    items: [
      {
        type: "normal",
        label: "WPS",
        value:
          selectedWeld?.wps?.internalId ??
          selectedWeld?.wps?.document ??
          selectedWeld?.wps?.id?.toString() ??
          "\u00A0",
        onClick: handlers?.onWPSClick,
      },
      {
        type: "normal",
        label: "Filler Material",
        value:
          selectedWeld?.filler?.name ??
          selectedWeld?.filler?.id?.toString() ??
          "\u00A0",
        onClick: handlers?.onFillerClick,
      },
    ],
  },
];
