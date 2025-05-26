import React from 'react';
import { Column } from './types';
import { RowStateConfig } from './types';

export interface WorkTableRowProps<T> {
    item: T;
    columns: Column<T>[];
    handleRowClick: (item: T) => void;
    rowStates?: Record<string, RowStateConfig<T>>;
    rowStateAccessor?: (item: T) => string;
}

export function WorkTableRow<T extends { id: string | number }>(props: WorkTableRowProps<T>) {
    const { item, columns, handleRowClick, rowStates, rowStateAccessor } = props;
    const stateKey = rowStateAccessor ? rowStateAccessor(item) : 'default';
    const stateConfig = rowStates?.[stateKey];
    const onClickRow = () => {
        stateConfig?.onClick?.(item);
        handleRowClick(item);
    };
    const rowClass = stateConfig?.className ?? 'bg-dark text-light';
    return (
        <tr onClick={onClickRow} className={`cursor-pointer ${rowClass}`}>
            {columns.map(col => {
                const raw = typeof col.accessor === 'function'
                    ? col.accessor(item)
                    : (item[col.accessor as keyof T] as unknown);
                const value =
                    typeof raw === 'object' && raw !== null
                        ? JSON.stringify(raw)
                        : String(raw);

                return (
                    <td
                        key={`cell-${item.id}-${col.id}`}
                        className={`text-center py-3 bg-transparent ${col.className || ''}`}
                    >
                        {value}
                    </td>
                );
            })}
        </tr>
    );
}

