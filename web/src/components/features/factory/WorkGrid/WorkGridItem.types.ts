import * as React from "react";
import {HTMLMotionProps} from "framer-motion";

export interface ItemStateConfig {
    className?: string;
    onClick?: (item: any) => void;
}

export interface WorkGridItemProps extends HTMLMotionProps<'button'> {
    item: any;
    accessor: keyof any | ((item: any) => React.ReactNode);
    handleClick: (item: any) => void;
    itemStates?: Record<string, ItemStateConfig>;
    itemStateAccessor?: (item: any) => string;
}
