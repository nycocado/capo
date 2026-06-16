import React from "react";
import { HTMLMotionProps, motion } from "framer-motion";

export interface ItemStateConfig<T> {
  className?: string;
  onClick?: (item: T) => void;
}

export interface WorkGridItemProps<T> extends HTMLMotionProps<"button"> {
  item: T;
  accessor: keyof T | ((item: T) => React.ReactNode);
  handleClick: (item: T) => void;
  itemStates?: Record<string, ItemStateConfig<T>>;
  itemStateAccessor?: (item: T) => string;
}

export function WorkGridItem<T extends { id: number | string }>(
  props: WorkGridItemProps<T>,
) {
  const {
    item,
    accessor,
    handleClick,
    itemStates,
    itemStateAccessor,
    ...motionProps
  } = props;
  const stateKey = itemStateAccessor ? itemStateAccessor(item) : "default";
  const stateConfig = itemStates?.[stateKey];

  const onClick = () => {
    if (stateConfig?.onClick) {
      stateConfig.onClick(item);
    } else {
      handleClick(item);
    }
  };

  const className = stateConfig?.className ?? "";
  const raw =
    typeof accessor === "function"
      ? accessor(item)
      : (item[accessor] as React.ReactNode);
  const value =
    typeof raw === "object" && raw !== null ? JSON.stringify(raw) : String(raw);

  return (
    <motion.button
      onClick={onClick}
      className={`btn border-tertiary border-3 text-white ${className}`}
      style={{ height: "70px" }}
      {...motionProps}
    >
      {value}
    </motion.button>
  );
}
