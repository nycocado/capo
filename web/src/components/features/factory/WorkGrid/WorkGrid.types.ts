import * as React from "react";
import {ItemStateConfig} from "./WorkGridItem.types";
import {HTMLMotionProps} from "framer-motion";

export interface WorkGridProps extends HTMLMotionProps<'div'> {
    items: any[];
    accessor: keyof any | ((item: any) => React.ReactNode);
    handleItemClick: (item: any) => void;
    columns?: number;
    itemStates?: Record<string, ItemStateConfig>;
    itemStateAccessor?: (item: any) => string;
    groupBy?: (item: any) => string;
    renderGroupTitle?: (groupItems: any[], groupIndex: number) => React.ReactNode;
}
