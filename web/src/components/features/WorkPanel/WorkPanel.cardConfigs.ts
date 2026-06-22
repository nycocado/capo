import { PipeLengthWithContext, WeldWithContext } from "@interfaces";
import { CardConfig } from "@components/features/WorkPanel/WorkPanel";

const EMPTY = "\u00A0";

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
          value: selectedItem?.length?.toString() ?? EMPTY,
          tag: "mm",
        },
        {
          type: "double",
          label: "Diameter (DN)",
          primaryValue: selectedItem?.diameter?.nominalMm?.toString() ?? EMPTY,
          primaryTag: "mm",
          secondaryValue: selectedItem?.diameter?.nominalInch ?? EMPTY,
          secondaryTag: "inch",
        },
      ],
    },
    {
      items: [
        {
          type: "normal",
          label: "ID",
          value: selectedItem?.internalId ?? EMPTY,
        },
        {
          type: "normal",
          label: "Heat Number",
          value: selectedItem?.heatNumber ?? EMPTY,
          onClick: handlers?.onHeatNumberClick,
        },
      ],
    },
    {
      items: [
        {
          type: "normal",
          label: "Isometric",
          value: selectedItem?.isometricInfo?.internalId ?? EMPTY,
        },
        {
          type: "normal",
          label: "Material",
          value: selectedItem?.material?.name ?? EMPTY,
        },
      ],
    },
    {
      items: [
        {
          type: "tagged",
          label: "Thickness",
          value: selectedItem?.thickness?.toString() ?? EMPTY,
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
        value: selectedItem?.spoolInfo?.internalId ?? EMPTY,
      },
      {
        type: "normal",
        label: "TPI",
        value: selectedItem?.wps?.tpi?.toString() ?? EMPTY,
      },
    ],
  },
  {
    items: [
      {
        type: "normal",
        label: "WPS",
        value: selectedItem?.wps?.internalId ?? EMPTY,
        onClick: handlers?.onWPSClick,
      },
      {
        type: "normal",
        label: "Filler Material",
        value: selectedItem?.fillerMaterial?.name ?? EMPTY,
        onClick: handlers?.onFillerClick,
      },
    ],
  },
];
