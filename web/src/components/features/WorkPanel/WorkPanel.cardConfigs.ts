import { PipeLengthWithContext, WeldWithContext } from "@/interfaces";
import { CardConfig } from "@components/features/WorkPanel/WorkPanel";

export interface CutCardHandlers {
  onHeatNumberClick?: () => void;
}

export interface WeldCardHandlers {
  onWPSClick?: () => void;
  onFillerClick?: () => void;
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

export const weldCardConfigs = (
  selectedItem: WeldWithContext | null,
  handlers?: WeldCardHandlers,
): CardConfig[] => [
  {
    items: [
      {
        type: "normal",
        label: "Spool",
        value: selectedItem?.spoolInfo?.internalId ?? "\u00A0",
      },
      {
        type: "normal",
        label: "TPI",
        value: selectedItem?.wps?.tpi?.toString() ?? "\u00A0",
      },
    ],
  },
  {
    items: [
      {
        type: "normal",
        label: "WPS",
        value: selectedItem?.wps?.internalId ?? "\u00A0",
        onClick: handlers?.onWPSClick,
      },
      {
        type: "normal",
        label: "Filler Material",
        value: selectedItem?.fillerMaterial?.name ?? "\u00A0",
        onClick: handlers?.onFillerClick,
      },
    ],
  },
];
