import React from 'react';
import {motion} from 'framer-motion';
import {WorkGridProps} from './WorkGrid.types';
import {WorkGridItem} from './WorkGridItem';

export function WorkGrid(
    props: WorkGridProps
) {
    const {
        items,
        accessor,
        handleItemClick,
        columns = 3,
        itemStates,
        itemStateAccessor,
        groupBy,
        renderGroupTitle
    } = props;
    // partition items into groups
    const groups = groupBy
        ? (() => {
            const m = new Map<string, any[]>();
            items.forEach(item => {
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
                className="flex-grow-1 d-flex flex-column rounded-3 overflow-auto bg-dark"
                style={{height: '400px'}}
            >
                {groups.map((groupItems, gi) => (
                    <React.Fragment key={gi}>
                        <div className="p-4">
                            {renderGroupTitle?.(groupItems, gi)}
                            <motion.div className="d-grid gap-4"
                                        style={{gridTemplateColumns: `repeat(${columns}, 1fr)`}}>
                                {groupItems.map(item => (
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
                        {gi < groups.length - 1 && <hr className="border-white border-3 my-2"/>}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
}

