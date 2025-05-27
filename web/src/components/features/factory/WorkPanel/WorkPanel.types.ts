import {NormalValueConfig} from "./values/NormalValue.types";
import {TaggedValueConfig} from "./values/TaggedValue.types";
import {DoubleValueConfig} from "./values/DoubleValue.types";

export type ValueConfig = NormalValueConfig | TaggedValueConfig | DoubleValueConfig;

export interface CardConfig {
    key?: string;
    className?: string;
    items: ValueConfig[];
}

export interface WorkPanelProps {
    cards: CardConfig[];
    containerClassName?: string;
}
