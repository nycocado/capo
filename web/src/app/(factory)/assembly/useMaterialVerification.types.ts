import {PipeLength} from "@models/pipe-length.interface";
import {Fitting} from "@models/fitting.interface";

export type VerificationStep = 'pipeLength' | 'fitting';
export type MaterialState = 'initial' | 'finished';

export interface VerificationState {
    pipeLengthStates: Record<string, MaterialState>;
    fittingStates: Record<string, MaterialState>;
}

export type VerificationAction =
    | { type: 'togglePipeLength'; id: string }
    | { type: 'toggleFitting'; id: string }
    | { type: 'reset' };


export interface MaterialsResponse {
    pipeLengths: PipeLength[];
    fittings: Fitting[];
}