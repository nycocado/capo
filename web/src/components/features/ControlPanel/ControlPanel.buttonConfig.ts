import { ControlButtonConfig } from "@components/features/ControlPanel/ControlPanel";

export interface cutButtonHandlers {
  onIsometricClick?: () => void;
  onNoteClick?: () => void;
  onReportClick?: () => void;
  onNextClick?: () => void;
}

export interface assemblyButtonHandlers {
  onIsometricClick?: () => void;
  onListClick?: () => void;
  onNoteClick?: () => void;
  onReportClick?: () => void;
  onNextClick?: () => void;
}

export interface weldButtonHandlers {
  onWpsClick?: () => void;
  onNoteClick?: () => void;
  onReportClick?: () => void;
  onNextClick?: () => void;
}

export const cutButtonConfig = (
  handlers?: cutButtonHandlers,
): ControlButtonConfig[] => [
  {
    variant: "outline-light",
    label: "Isometric",
    onClick: handlers?.onIsometricClick,
  },
  {
    variant: "outline-light",
    label: "Note",
    onClick: handlers?.onNoteClick,
  },
  {
    variant: "outline-light",
    label: "Report",
    onClick: handlers?.onReportClick,
  },
  {
    variant: "primary",
    label: "Next",
    onClick: handlers?.onNextClick,
  },
];

export const assemblyButtonConfig = (
  handlers?: assemblyButtonHandlers,
): ControlButtonConfig[] => [
  {
    variant: "outline-light",
    label: "Isometric",
    onClick: handlers?.onIsometricClick,
  },
  {
    variant: "outline-light",
    label: "List",
    onClick: handlers?.onListClick,
  },
  {
    variant: "outline-light",
    label: "Note",
    onClick: handlers?.onNoteClick,
  },
  {
    variant: "outline-light",
    label: "Report",
    onClick: handlers?.onReportClick,
  },
  {
    variant: "primary",
    label: "Next",
    onClick: handlers?.onNextClick,
  },
];

export const weldButtonConfig = (
  handlers?: weldButtonHandlers,
): ControlButtonConfig[] => [
  {
    variant: "outline-light",
    label: "WPS",
    onClick: handlers?.onWpsClick,
  },
  {
    variant: "outline-light",
    label: "Note",
    onClick: handlers?.onNoteClick,
  },
  {
    variant: "outline-light",
    label: "Report",
    onClick: handlers?.onReportClick,
  },
  {
    variant: "primary",
    label: "Next",
    onClick: handlers?.onNextClick,
  },
];
