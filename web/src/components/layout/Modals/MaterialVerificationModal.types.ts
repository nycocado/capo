import {PipeLength} from "@models/pipe-length.interface";
import {Fitting} from "@models/fitting.interface";

export interface MaterialVerificationModalProps {
    showModal: boolean;
    currentStep: 'pipeLength' | 'fitting';
    currentStepData: any[];
    currentStepTitle: string;
    canContinue: boolean;
    canGoToPrevious: boolean;
    canGoToNext: boolean;
    loading: boolean;
    error: string | null;
    isConsultationMode: boolean;
    handlePipeLengthClick: (pipeLength: PipeLength) => void;
    handleFittingClick: (fitting: Fitting) => void;
    handleContinue: () => void;
    handleNext: () => void;
    handlePrevious: () => void;
    handleCancel: () => void;
    getPipeLengthState: (pipeLength: PipeLength) => 'initial' | 'finished';
    getFittingState: (fitting: Fitting) => 'initial' | 'finished';
}