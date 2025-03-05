import React from "react";
import {
    DoubleValueConfig,
    NormalValueConfig,
    TaggedValueConfig,
} from "@components/features/factory/WorkPanel";

export type ValueConfig = TaggedValueConfig | NormalValueConfig | DoubleValueConfig;

export interface ComponentLabelModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: () => void;
    title: string;
    value: string;
    values?: ValueConfig[];
    valueCardClassName?: string;
    valueTextStyle?: React.CSSProperties;
}