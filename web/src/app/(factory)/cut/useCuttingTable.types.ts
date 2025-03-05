import {AllState, WorkState} from "@/app/(factory)/cut/CutClient.types";
import {PipeLength} from "@models/pipe-length.interface";

export type CuttingAction =
    | { type: 'toggleInfo'; id: number }
    | { type: 'workClick'; id: number }
    | { type: 'resetInfo'; id: number }
    | { type: 'proceedToWorking'; id: number };

export interface CuttingState {
    allState: Record<number, AllState>;
    workState: Record<number, WorkState>;
}

export interface UseCuttingTableCallbacks {
    onWorkingTransition?: (item: PipeLength) => void;
    onItemCompleted?: (item: PipeLength) => void;
}