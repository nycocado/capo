import React, { forwardRef } from "react";
import { HTMLMotionProps, motion } from "framer-motion";
import { Column } from "@components/features/WorkTable/WorkTable";

export interface WorkTableRowProps extends HTMLMotionProps<"tr"> {
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

export const WorkTableRow = forwardRef(function WorkTableRow(
  props: WorkTableRowProps,
  ref: React.Ref<HTMLTableRowElement>,
) {
  const {
    item,
    columns,
    handleRowClick,
    rowStates,
    rowStateAccessor,
    ...motionProps
  } = props;
  const stateKey = rowStateAccessor ? rowStateAccessor(item) : "default";
  const stateConfig = rowStates?.[stateKey];

  const onClickRow = () => {
    if (stateConfig?.onClick) {
      stateConfig.onClick(item);
    }
    if (handleRowClick) {
      handleRowClick(item);
    }
  };

  const rowClass = stateConfig?.className ?? "bg-dark";

  return (
    <motion.tr
      key={item?.id || "unknown"} // Proteção contra item undefined
      ref={ref}
      onClick={onClickRow}
      className={`cursor-pointer ${rowClass}`}
      style={{ cursor: "pointer" }}
      {...motionProps}
    >
      {columns.map((col) => {
        const raw =
          typeof col.accessor === "function"
            ? col.accessor(item)
            : (item?.[col.accessor as keyof any] as unknown);
        const value =
          typeof raw === "object" && raw !== null
            ? JSON.stringify(raw)
            : String(raw);

        return (
          <td
            key={`cell-${item?.id || "unknown"}-${col.id}`}
            className={`text-center py-3 bg-transparent ${col.className || ""}`}
          >
            {value}
          </td>
        );
      })}
    </motion.tr>
  );
});
