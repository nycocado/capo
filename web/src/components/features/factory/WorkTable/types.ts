import * as React from "react";

export interface Column<T> {
    header: string;
    subheader?: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
}

export interface WorkTableProps<T extends { id: string | number }> {
    activeTab: string;
    allItems: T[];
    workingItems: T[];
    handleRowClick: (item: T) => void;
    columns: Column<T>[];
}