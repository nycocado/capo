import React, {forwardRef} from 'react';
import {motion} from 'framer-motion';
import {WorkGridItemProps} from './WorkGridItem.types';

export const WorkGridItem = forwardRef<HTMLButtonElement, WorkGridItemProps>(
    (props, ref) => {
        const {item, accessor, handleClick, itemStates, itemStateAccessor, ...motionProps} = props;
        const stateKey = itemStateAccessor ? itemStateAccessor(item) : 'default';
        const stateConfig = itemStates?.[stateKey];

        const onClick = () => {
            if (stateConfig?.onClick) {
                stateConfig.onClick(item);
            } else {
                handleClick(item);
            }
        };

        const className = stateConfig?.className ?? '';
        const raw = typeof accessor === 'function'
            ? accessor(item)
            : (item[accessor] as React.ReactNode);
        const value = typeof raw === 'object' && raw !== null ? JSON.stringify(raw) : String(raw);

        return (
            <motion.button
                ref={ref}
                onClick={onClick}
                className={`btn border-tertiary border-3 text-white ${className}`}
                style={{height: '70px'}}
                {...motionProps}
            >
                {value}
            </motion.button>
        );
    }
);
WorkGridItem.displayName = 'WorkGridItem';