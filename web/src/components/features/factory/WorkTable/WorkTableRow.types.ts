import {HTMLMotionProps} from "framer-motion";
import {Column} from "./WorkTable.types";

export interface WorkTableRowProps extends HTMLMotionProps<'tr'> {
    item: any;
    columns: Column<any>[];
    handleRowClick: (item: any) => void;
    rowStates?: Record<string, RowStateConfig<any>>;
    rowStateAccessor?: (item: any) => string;
}

export interface RowStateConfig<T> {
    className?: string;
    onClick?: (item: T) => void;
}
