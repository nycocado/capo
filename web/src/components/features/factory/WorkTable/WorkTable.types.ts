import * as React from "react";
import {RowStateConfig} from "./WorkTableRow.types";

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
    id: string;
    header: string;
    subheader?: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    sortable?: boolean;
}

export interface WorkTableProps {
    items: any[];
    handleRowClick: (item: any) => void;
    columns: Column<any>[];
    defaultSortColumn?: string;
    defaultSortDirection?: SortDirection;
    hover?: boolean;
    rowStates?: Record<string, RowStateConfig<any>>;
    rowStateAccessor?: (item: any) => string;
}