import * as React from "react";

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
    id: string;
    header: string;
    subheader?: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    sortable?: boolean;
}

export interface WorkTableProps<T extends { id: string | number }> {
    items: T[];
    handleRowClick: (item: T) => void;
    columns: Column<T>[];
    defaultSortColumn?: string;
    defaultSortDirection?: SortDirection;
}
