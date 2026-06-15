import React from "react";
import { HTMLMotionProps, motion } from "framer-motion";
import { ItemStateConfig, WorkGridItem } from "./WorkGridItem";

export interface WorkGridProps extends HTMLMotionProps<"div"> {
  items: any[];
  accessor: keyof any | ((item: any) => React.ReactNode);
  handleItemClick: (item: any) => void;
  columns?: number;
  itemStates?: Record<string, ItemStateConfig>;
  itemStateAccessor?: (item: any) => string;
  groupBy?: (item: any) => string;
  renderGroupTitle?: (groupItems: any[], groupIndex: number) => React.ReactNode;
}

export function WorkGrid(props: WorkGridProps) {
  const {
    items,
    accessor,
    handleItemClick,
    columns = 3,
    itemStates,
    itemStateAccessor,
    groupBy,
    renderGroupTitle,
  } = props;
  // partition items into groups
  const groups = groupBy
    ? (() => {
        const m = new Map<string, any[]>();
        items.forEach((item) => {
          const key = groupBy(item);
          const arr = m.get(key) ?? [];
          if (!m.has(key)) m.set(key, arr);
          arr.push(item);
        });
        return Array.from(m.values());
      })()
    : [items];

  return (
    <div className="d-flex flex-column h-100">
      <div
        className="flex-grow-1 d-flex flex-column overflow-auto op-panel"
        style={{ height: "400px" }}
      >
        {groups.map((groupItems, gi) => (
          <React.Fragment key={gi}>
            <div className="p-4">
              {renderGroupTitle?.(groupItems, gi)}
              <motion.div
                className="d-grid gap-4"
                style={{
                  gridTemplateColumns: `repeat(${columns}, 1fr)`,
                }}
              >
                {groupItems.map((item) => (
                  <WorkGridItem
                    key={item.id}
                    item={item}
                    accessor={accessor}
                    handleClick={handleItemClick}
                    itemStates={itemStates}
                    itemStateAccessor={itemStateAccessor}
                    layout
                  />
                ))}
              </motion.div>
            </div>
            {gi < groups.length - 1 && <hr className="op-divider my-2" />}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
