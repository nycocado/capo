import {ControlButtonConfig} from "@components/features/factory/ControlPanel/ControlPanel.types";

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
    handlers?: cutButtonHandlers
): ControlButtonConfig[] => [
    {
        variant: 'outline-complement',
        label: 'Isometric',
        onClick: handlers?.onIsometricClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    },
    {
        variant: 'outline-note',
        label: 'Note',
        onClick: handlers?.onNoteClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    },
    {
        variant: 'outline-danger',
        label: 'Report',
        onClick: handlers?.onReportClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    },
    {
        variant: 'outline-success',
        label: 'Next',
        onClick: handlers?.onNextClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    }
]

export const assemblyButtonConfig = (
    handlers?: assemblyButtonHandlers
): ControlButtonConfig[] => [
    {
        variant: 'outline-complement',
        label: 'Isometric',
        onClick: handlers?.onIsometricClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    },
    {
        variant: 'outline-info',
        label: 'List',
        onClick: handlers?.onListClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    },
    {
        variant: 'outline-note',
        label: 'Note',
        onClick: handlers?.onNoteClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    },
    {
        variant: 'outline-danger',
        label: 'Report',
        onClick: handlers?.onReportClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    },
    {
        variant: 'outline-success',
        label: 'Next',
        onClick: handlers?.onNextClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    }
]

export const weldButtonConfig = (
    handlers?: weldButtonHandlers
): ControlButtonConfig[] => [
    {
        variant: 'outline-info',
        label: 'WPS',
        onClick: handlers?.onWpsClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    },
    {
        variant: 'outline-note',
        label: 'Note',
        onClick: handlers?.onNoteClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    },
    {
        variant: 'outline-danger',
        label: 'Report',
        onClick: handlers?.onReportClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    },
    {
        variant: 'outline-success',
        label: 'Next',
        onClick: handlers?.onNextClick,
        className: 'mb-2 border-3',
        style: {minHeight: '50px'}
    }
]