import {PipeLength} from "@models/pipe-length.interface";

export interface CutClientProps {
    initialItems: PipeLength[];
    initialSelectedItem?: PipeLength | null;
    fetchError?: string;
}

export interface RowState {
    className: string;
    onClick?: (item: PipeLength) => void;
}

export type AllState = 'initial' | 'information' | 'finished';
export type WorkState = 'initial' | 'information' | 'working' | 'finished';