import { useState, useMemo, useCallback, useReducer } from "react";
import { PipeLengthDto, FittingDto, AssemblyListDto } from "@/dtos";

export type VerificationStep = "pipeLength" | "fitting";
export type MaterialState = "initial" | "finished";

export interface VerificationState {
  pipeLengthStates: Record<string, MaterialState>;
  fittingStates: Record<string, MaterialState>;
}

export type VerificationAction =
  | { type: "togglePipeLength"; id: string }
  | { type: "toggleFitting"; id: string }
  | { type: "reset" };

export interface MaterialsResponse {
  pipeLengths: PipeLengthDto[];
  fittings: FittingDto[];
}

const verificationReducer = (
  state: VerificationState,
  action: VerificationAction,
): VerificationState => {
  switch (action.type) {
    case "togglePipeLength": {
      const currentState = state.pipeLengthStates[action.id] || "initial";
      return {
        ...state,
        pipeLengthStates: {
          ...state.pipeLengthStates,
          [action.id]: currentState === "initial" ? "finished" : "initial",
        },
      };
    }
    case "toggleFitting": {
      const currentState = state.fittingStates[action.id] || "initial";
      return {
        ...state,
        fittingStates: {
          ...state.fittingStates,
          [action.id]: currentState === "initial" ? "finished" : "initial",
        },
      };
    }
    case "reset": {
      return {
        pipeLengthStates: {},
        fittingStates: {},
      };
    }
    default:
      return state;
  }
};

// CORREÇÃO: Extrair materiais do AssemblyListDto em vez de buscar na API
function extractMaterialsFromAssemblyList(
  assemblyList: AssemblyListDto,
): MaterialsResponse {
  const allPipeLengths: PipeLengthDto[] = [];
  const allFittings: FittingDto[] = [];

  // Extrair pipe lengths e fittings de todos os sheets
  assemblyList.isometric?.sheets?.forEach((sheet) => {
    if (sheet.pipeLengths) {
      allPipeLengths.push(...sheet.pipeLengths);
    }
    if (sheet.fittings) {
      allFittings.push(...sheet.fittings);
    }
  });

  return {
    pipeLengths: allPipeLengths,
    fittings: allFittings,
  };
}

export function useAssemblyMaterialVerification() {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] =
    useState<VerificationStep>("pipeLength");
  const [materials, setMaterials] = useState<MaterialsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onVerificationComplete, setOnVerificationComplete] = useState<
    (() => void) | null
  >(null);
  const [isConsultationMode, setIsConsultationMode] = useState(false);

  const [state, dispatch] = useReducer(verificationReducer, {
    pipeLengthStates: {},
    fittingStates: {},
  });

  // Check verification status
  const allPipeLengthsVerified = useMemo(() => {
    if (!materials?.pipeLengths.length) return true;
    return materials.pipeLengths.every(
      (pipeLength) =>
        state.pipeLengthStates[pipeLength.internalId] === "finished",
    );
  }, [materials, state.pipeLengthStates]);

  const allFittingsVerified = useMemo(() => {
    if (!materials?.fittings.length) return true;
    return materials.fittings.every(
      (fitting) => state.fittingStates[fitting.internalId] === "finished",
    );
  }, [materials, state.fittingStates]);

  const canContinue = useMemo(() => {
    if (isConsultationMode) return false;
    return currentStep === "pipeLength"
      ? allPipeLengthsVerified
      : allFittingsVerified;
  }, [
    currentStep,
    allPipeLengthsVerified,
    allFittingsVerified,
    isConsultationMode,
  ]);

  const canGoToPrevious = useMemo(
    () => currentStep === "fitting",
    [currentStep],
  );

  const canGoToNext = useMemo(() => {
    if (!isConsultationMode) return false;
    return (
      currentStep === "pipeLength" &&
      !!(materials?.fittings && materials.fittings.length > 0)
    );
  }, [isConsultationMode, currentStep, materials]);

  // CORREÇÃO: Start verification usando dados do AssemblyListDto
  const startVerification = useCallback(
    async (assemblyList: AssemblyListDto, onComplete: () => void) => {
      setLoading(true);
      setError(null);
      setOnVerificationComplete(() => onComplete);
      setIsConsultationMode(false);
      dispatch({ type: "reset" });

      try {
        // Extrair materiais do AssemblyListDto - sem chamada de API!
        const extractedMaterials =
          extractMaterialsFromAssemblyList(assemblyList);
        setMaterials(extractedMaterials);
        setCurrentStep("pipeLength");
        setShowModal(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to extract materials",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // CORREÇÃO: Open materials for consultation usando dados do AssemblyListDto
  const openMaterialsConsultation = useCallback(
    async (assemblyList: AssemblyListDto) => {
      setLoading(true);
      setError(null);
      setOnVerificationComplete(null);
      setIsConsultationMode(true);

      try {
        // Extrair materiais do AssemblyListDto - sem chamada de API!
        const extractedMaterials =
          extractMaterialsFromAssemblyList(assemblyList);
        setMaterials(extractedMaterials);
        setCurrentStep("pipeLength");
        setShowModal(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to extract materials",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Handle clicks
  const handlePipeLengthClick = useCallback(
    (pipeLength: PipeLengthDto) => {
      if (isConsultationMode) return;
      if (pipeLength?.internalId) {
        dispatch({ type: "togglePipeLength", id: pipeLength.internalId });
      }
    },
    [isConsultationMode],
  );

  const handleFittingClick = useCallback(
    (fitting: FittingDto) => {
      if (isConsultationMode) return;
      if (fitting?.internalId) {
        dispatch({ type: "toggleFitting", id: fitting.internalId });
      }
    },
    [isConsultationMode],
  );

  // Continue to next step or complete
  const handleContinue = useCallback(() => {
    if (isConsultationMode) return;

    if (currentStep === "pipeLength" && allPipeLengthsVerified) {
      if (materials?.fittings.length) {
        setCurrentStep("fitting");
      } else {
        setShowModal(false);
        onVerificationComplete?.();
        setOnVerificationComplete(null);
      }
    } else if (currentStep === "fitting" && allFittingsVerified) {
      setShowModal(false);
      onVerificationComplete?.();
      setOnVerificationComplete(null);
    }
  }, [
    currentStep,
    allPipeLengthsVerified,
    allFittingsVerified,
    materials?.fittings.length,
    onVerificationComplete,
    isConsultationMode,
  ]);

  // Navigate between steps
  const handleNext = useCallback(() => {
    if (isConsultationMode && currentStep === "pipeLength") {
      setCurrentStep("fitting");
    }
  }, [isConsultationMode, currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep === "fitting") {
      setCurrentStep("pipeLength");
    }
  }, [currentStep]);

  // Cancel/Close modal
  const handleCancel = useCallback(() => {
    setShowModal(false);
    setTimeout(() => {
      setOnVerificationComplete(null);
      setError(null);
      setIsConsultationMode(false);
      dispatch({ type: "reset" });
    }, 300);
  }, []);

  // Get states
  const getPipeLengthState = useCallback(
    (pipeLength: PipeLengthDto): MaterialState => {
      if (isConsultationMode) return "initial";
      return pipeLength?.internalId
        ? state.pipeLengthStates[pipeLength.internalId] || "initial"
        : "initial";
    },
    [state.pipeLengthStates, isConsultationMode],
  );

  const getFittingState = useCallback(
    (fitting: FittingDto): MaterialState => {
      if (isConsultationMode) return "initial";
      return fitting?.internalId
        ? state.fittingStates[fitting.internalId] || "initial"
        : "initial";
    },
    [state.fittingStates, isConsultationMode],
  );

  // Current step data and title
  const currentStepData = useMemo(() => {
    if (!materials) return [];
    return currentStep === "pipeLength"
      ? materials.pipeLengths
      : materials.fittings;
  }, [materials, currentStep]);

  const currentStepTitle = useMemo(() => {
    const stepNames = {
      pipeLength: "Pipe Length List",
      fitting: "Fitting List",
    };
    return isConsultationMode
      ? stepNames[currentStep]
      : currentStep === "pipeLength"
        ? "Pipe Length Verification"
        : "Fitting Verification";
  }, [currentStep, isConsultationMode]);

  return {
    showModal,
    currentStep,
    currentStepData,
    currentStepTitle,
    canContinue,
    canGoToPrevious,
    canGoToNext,
    loading,
    error,
    isConsultationMode,
    startVerification,
    openMaterialsConsultation,
    handlePipeLengthClick,
    handleFittingClick,
    handleContinue,
    handleNext,
    handlePrevious,
    handleCancel,
    getPipeLengthState,
    getFittingState,
  };
}
