import React from "react";

export interface ControlButtonConfig {
    variant: string;
    label: string;
    onClick?: () => void;
    className?: string;
    style?: React.CSSProperties;
}

export interface ControlPanelProps {
    search: string;
    setSearch: (value: string) => void;
    buttons: ControlButtonConfig[];
    tag: string;
}