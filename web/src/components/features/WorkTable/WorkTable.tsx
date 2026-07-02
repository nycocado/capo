import { Table } from "react-bootstrap";
import { motion } from "framer-motion";
import { useState, useMemo, type ReactNode } from "react";
import { BarsArrowDownIcon } from "@heroicons/react/16/solid";
import { BarsArrowUpIcon } from "@heroicons/react/16/solid";
import { RowStateConfig, WorkTableRow } from "./WorkTableRow";

export type SortDirection = "asc" | "desc" | null;

export interface Column<T> {
  id: string;
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  sortable?: boolean;
  searchable?: boolean;
}

export interface WorkTableProps<T> {
  items: T[];
  handleRowClick: (item: T) => void;
  columns: Column<T>[];
  defaultSortColumn?: string;
  defaultSortDirection?: SortDirection;
  hover?: boolean;
  rowStates?: Record<string, RowStateConfig<T>>;
  rowStateAccessor?: (item: T) => string;
}

export function WorkTable<T extends { id: number | string }>(
  props: WorkTableProps<T>,
) {
  const {
    items,
    handleRowClick,
    columns,
    defaultSortColumn,
    defaultSortDirection = null,
    hover = false,
    rowStates,
    rowStateAccessor,
  } = props;

  const [sortColumn, setSortColumn] = useState<string | null>(
    defaultSortColumn || null,
  );
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(defaultSortDirection);

  const handleSort = (columnId: string, sortable?: boolean) => {
    if (!sortable) return;

    if (sortColumn === columnId) {
      setSortDirection((prev) =>
        prev === "asc" ? "desc" : prev === "desc" ? null : "asc",
      );
      if (sortDirection === "desc") {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnId);
      setSortDirection("asc");
    }
  };

  const sortedItems = useMemo(() => {
    if (!sortColumn || !sortDirection) return items;

    const column = columns.find((col) => col.id === sortColumn);

    if (!column) return items;

    return [...items].sort((a, b) => {
      let valueA: unknown;
      let valueB: unknown;

      if (typeof column.accessor === "function") {
        valueA = column.accessor(a);
        valueB = column.accessor(b);
      } else {
        valueA = a[column.accessor];
        valueB = b[column.accessor];
      }

      const isNumericA = !isNaN(Number(valueA));
      const isNumericB = !isNaN(Number(valueB));

      if (isNumericA && isNumericB) {
        return sortDirection === "asc"
          ? Number(valueA) - Number(valueB)
          : Number(valueB) - Number(valueA);
      }

      const strA = String(valueA || "").toLowerCase();
      const strB = String(valueB || "").toLowerCase();

      return sortDirection === "asc"
        ? strA.localeCompare(strB)
        : strB.localeCompare(strA);
    });
  }, [items, sortColumn, sortDirection, columns]);

  const renderSortIcon = (columnId: string) => {
    if (sortColumn !== columnId) return null;

    return (
      <span className="ms-1">
        {sortDirection === "asc" ? (
          <BarsArrowDownIcon style={{ height: "20px" }} />
        ) : sortDirection === "desc" ? (
          <BarsArrowUpIcon style={{ height: "20px" }} />
        ) : (
          ""
        )}
      </span>
    );
  };

  return (
    <div className="d-flex flex-column h-100">
      <div
        className="flex-grow-1 d-flex flex-column op-panel op-table op-scroll"
        style={{ height: "400px" }}
      >
        <Table variant="dark" hover={hover} className="mb-0 w-100">
          <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`text-center py-3 ${col.className || ""} ${col.sortable ? "cursor-pointer" : ""}`}
                  onClick={() => handleSort(col.id, col.sortable)}
                  style={{
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                >
                  {col.header}
                  {renderSortIcon(col.id)}
                </th>
              ))}
            </tr>
          </thead>
          <motion.tbody layout initial={false} className="">
            {sortedItems.map((item) => {
              return (
                <WorkTableRow
                  key={item.id}
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
