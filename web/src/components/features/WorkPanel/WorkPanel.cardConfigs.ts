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
          value: selectedItem?.length?.toString() ?? " ",
          tag: "mm",
        },
        {
          type: "double",
          label: "Diameter (DN)",
          primaryValue: selectedItem?.diameter?.nominalMm?.toString() ?? " ",
          primaryTag: "mm",
          secondaryValue: selectedItem?.diameter?.nominalInch ?? " ",
          secondaryTag: "inch",
        },
      ],
    },
    {
      items: [
        {
          type: "normal",
          label: "ID",
          value: selectedItem?.internalId ?? " ",
        },
        {
          type: "normal",
          label: "Heat Number",
          value: selectedItem?.heatNumber ?? " ",
          onClick: handlers?.onHeatNumberClick,
        },
      ],
    },
    {
      items: [
        {
          type: "normal",
          label: "Isometric",
          value: selectedItem?.isometricInfo?.internalId ?? " ",
        },
        {
          type: "normal",
          label: "Material",
          value: selectedItem?.material?.name ?? " ",
        },
      ],
    },
    {
      items: [
        {
          type: "tagged",
          label: "Thickness",
          value: selectedItem?.thickness?.toString() ?? " ",
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
        value: selectedItem?.spoolInfo?.internalId ?? " ",
      },
      {
        type: "normal",
        label: "TPI",
        value: selectedItem?.wps?.tpi?.toString() ?? " ",
      },
    ],
  },
  {
    items: [
      {
        type: "normal",
        label: "WPS",
        value: selectedItem?.wps?.internalId ?? " ",
        onClick: handlers?.onWPSClick,
      },
      {
        type: "normal",
        label: "Filler Material",
        value: selectedItem?.fillerMaterial?.name ?? " ",
        onClick: handlers?.onFillerClick,
      },
    ],
  },
];
