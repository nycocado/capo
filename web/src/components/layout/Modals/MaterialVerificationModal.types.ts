import { PipeLengthDto } from "@/dtos/pipe-length.dto";
import { FittingDto } from "@/dtos/fitting.dto";

export interface MaterialVerificationModalProps {
  showModal: boolean;
  currentStep: "pipeLength" | "fitting";
  currentStepData: any[];
  currentStepTitle: string;
  canContinue: boolean;
  canGoToPrevious: boolean;
  canGoToNext: boolean;
  loading: boolean;
  error: string | null;
  isConsultationMode: boolean;
  handlePipeLengthClick: (pipeLength: PipeLengthDto) => void;
  handleFittingClick: (fitting: FittingDto) => void;
  handleContinue: () => void;
  handleNext: () => void;
  handlePrevious: () => void;
  handleCancel: () => void;
  getPipeLengthState: (pipeLength: PipeLengthDto) => "initial" | "finished";
  getFittingState: (fitting: FittingDto) => "initial" | "finished";
}
