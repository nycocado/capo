import { HTMLMotionProps, motion } from "framer-motion";
import { Column } from "@components/features/WorkTable/WorkTable";

export interface WorkTableRowProps<T> extends HTMLMotionProps<"tr"> {
  item: T;
  columns: Column<T>[];
  handleRowClick: (item: T) => void;
  rowStates?: Record<string, RowStateConfig<T>>;
  rowStateAccessor?: (item: T) => string;
}

export interface RowStateConfig<T> {
  className?: string;
  onClick?: (item: T) => void;
}

export function WorkTableRow<T extends { id: number | string }>(
  props: WorkTableRowProps<T>,
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

  const rowClass = stateConfig?.className ?? "bg-secondary";

  return (
    <motion.tr
      key={item?.id || "unknown"}
      onClick={onClickRow}
      className={`cursor-pointer ${rowClass}`}
      style={{ cursor: "pointer" }}
      {...motionProps}
    >
      {columns.map((col) => {
        const raw =
          typeof col.accessor === "function"
            ? col.accessor(item)
            : (item?.[col.accessor] as unknown);
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
}
