import {Table} from "react-bootstrap";
import {motion} from 'framer-motion';
import {WorkTableProps, SortDirection} from "./WorkTable.types";
import {useState, useMemo} from "react";
import {BarsArrowDownIcon} from '@heroicons/react/16/solid';
import {BarsArrowUpIcon} from '@heroicons/react/16/solid';
import {WorkTableRow} from "./WorkTableRow";

export function WorkTable(
    props: WorkTableProps
) {
    const {
        items,
        handleRowClick,
        columns,
        defaultSortColumn,
        defaultSortDirection = null,
        hover = false,
        rowStates,
        rowStateAccessor
    } = props;

    const [sortColumn, setSortColumn] = useState<string | null>(defaultSortColumn || null);
    const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

    const handleSort = (columnId: string, sortable?: boolean) => {
        if (!sortable) return;

        if (sortColumn === columnId) {
            setSortDirection(prev =>
                prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
            );
            if (sortDirection === 'desc') {
                setSortColumn(null);
            }
        } else {
            setSortColumn(columnId);
            setSortDirection('asc');
        }
    };

    const sortedItems = useMemo(() => {
        if (!sortColumn || !sortDirection) return items;

        const column = columns.find(col => col.id === sortColumn);

        if (!column) return items;

        return [...items].sort((a, b) => {
            let valueA: unknown;
            let valueB: unknown;

            if (typeof column.accessor === 'function') {
                valueA = column.accessor(a);
                valueB = column.accessor(b);
            } else {
                valueA = a[column.accessor as keyof any];
                valueB = b[column.accessor as keyof any];
            }

            const isNumericA = !isNaN(Number(valueA));
            const isNumericB = !isNaN(Number(valueB));

            if (isNumericA && isNumericB) {
                return sortDirection === 'asc'
                    ? Number(valueA) - Number(valueB)
                    : Number(valueB) - Number(valueA);
            }

            const strA = String(valueA || '').toLowerCase();
            const strB = String(valueB || '').toLowerCase();

            return sortDirection === 'asc'
                ? strA.localeCompare(strB)
                : strB.localeCompare(strA);
        });
    }, [items, sortColumn, sortDirection, columns]);

    const renderSortIcon = (columnId: string) => {
        if (sortColumn !== columnId) return null;

        return (
            <span className="ms-1">
                {sortDirection === 'asc' ? <BarsArrowDownIcon style={{height: '20px'}}/> : sortDirection === 'desc' ?
                    <BarsArrowUpIcon style={{height: '20px'}}/> : ''}
            </span>
        );
    };

    return (
        <div className="d-flex flex-column h-100">
            <div
                className="flex-grow-1 d-flex flex-column rounded-3 overflow-auto bg-dark"
                style={{height: '400px'}}
            >
                <Table responsive variant="dark" hover={hover} className="mb-0">
                    <thead style={{position: 'sticky', top: 0, zIndex: 2}}>
                    <tr className="bg-dark"
                        style={{borderBottom: '1px solid white'}}
                    >
                        {columns.map((col) => (
                            <th
                                key={col.id}
                                className={`text-center border-bottom border-light py-3 bg-dark ${col.className || ''} ${col.sortable ? 'cursor-pointer' : ''}`}
                                onClick={() => handleSort(col.id, col.sortable)}
                                style={{cursor: col.sortable ? 'pointer' : 'default'}}
                            >
                                {col.header}
                                {renderSortIcon(col.id)}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <motion.tbody layout initial={false} className="">
                        {sortedItems.map(item => {
                            return (
                                <WorkTableRow
                                    key={item?.id || Math.random()}
                                    item={item}
                                    columns={columns}
                                    handleRowClick={handleRowClick}
                                    rowStates={rowStates}
                                    rowStateAccessor={rowStateAccessor}
                                    initial={false}
                                    layout
                                />
                            );
                        })}
                    </motion.tbody>
                </Table>
            </div>
        </div>
    );
}
