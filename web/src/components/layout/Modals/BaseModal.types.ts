import React from "react";

export interface BaseModalProps {
    show: boolean;
    onHide: () => void;
    title: string;
    titleClassName?: string;
    size?: 'sm' | 'lg' | 'xl' | undefined;
    centered?: boolean;
    backdrop?: 'static' | boolean;
    keyboard?: boolean;
    contentClassName?: string;
    children: React.ReactNode;
}