import {Table} from "react-bootstrap";
import {WorkTableProps} from "./types";

export function WorkTable<T extends { id: string | number }>(
    props: WorkTableProps<T>
) {
    const {activeTab, allItems, workingItems, handleRowClick, columns} = props;
    const items = activeTab === 'all' ? allItems : workingItems;

    return (
        <div className="d-flex flex-column h-100">
            <div
                className="flex-grow-1 d-flex flex-column rounded-3 overflow-auto bg-dark"
                style={{height: '400px'}}
            >
                <Table borderless hover responsive variant="dark" className="mb-0">
                    <thead>
                    <tr className="bg-dark">
                        {columns.map((col, idx) => (
                            <th
                                key={`header-${idx}`}
                                className={`text-center border-bottom border-light py-3 bg-dark ${col.className || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {items.map(item => (
                        <tr
                            key={item.id}
                            onClick={() => handleRowClick(item)}
                            className="cursor-pointer bg-dark"
                        >
                            {columns.map((col, idx) => {
                                const value =
                                    typeof col.accessor === 'function'
                                        ? col.accessor(item)
                                        : item[col.accessor];
                                return (
                                    <td
                                        key={`${item.id}-${idx}`}
                                        className={`text-center py-3 bg-dark ${col.className || ''}`}
                                    >
                                        {typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value)}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    </tbody>
                </Table>
            </div>
        </div>
    );
}