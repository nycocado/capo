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
  pipeLengths: (PipeLengthDto & { id: number })[];
  fittings: (FittingDto & { id: number })[];
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
    case "reset":
      return { pipeLengthStates: {}, fittingStates: {} };
    default:
      return state;
  }
};

/** Extrai pipe-lengths e fittings de uma assembly-list (spools→joints→parts). */
function extractMaterialsFromAssemblyList(
  assemblyList: AssemblyListDto,
): MaterialsResponse {
  const pipeLengths: (PipeLengthDto & { id: number })[] = [];
  const fittings: (FittingDto & { id: number })[] = [];
  const seen = new Set<number>();

  for (const spool of assemblyList.isometric.spools ?? []) {
    for (const joint of spool.joints ?? []) {
      for (const part of [joint.part1, joint.part2]) {
        if (seen.has(part.id)) continue;
        seen.add(part.id);
        if (part.type === "pipe_length" && part.pipeLength) {
          pipeLengths.push({ ...part.pipeLength, id: part.id });
        } else if (part.type === "fitting" && part.fitting) {
          fittings.push({ ...part.fitting, id: part.id });
        }
      }
    }
  }

  return { pipeLengths, fittings };
}

/**
 * Controla o fluxo multi-passo de verificação de materiais antes de iniciar uma
 * assembly-list: exibe pipe-lengths e fittings extraídos do DTO para confirmação
 * do operador, e suporta modo de consulta só-leitura.
 */
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
  }, [currentStep, allPipeLengthsVerified, allFittingsVerified, isConsultationMode]);

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

  const startVerification = useCallback(
    async (assemblyList: AssemblyListDto, onComplete: () => void) => {
      setLoading(true);
      setError(null);
      setOnVerificationComplete(() => onComplete);
      setIsConsultationMode(false);
      dispatch({ type: "reset" });

      try {
        setMaterials(extractMaterialsFromAssemblyList(assemblyList));
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

  const openMaterialsConsultation = useCallback(
    async (assemblyList: AssemblyListDto) => {
      setLoading(true);
      setError(null);
      setOnVerificationComplete(null);
      setIsConsultationMode(true);

      try {
        setMaterials(extractMaterialsFromAssemblyList(assemblyList));
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

  const handleNext = useCallback(() => {
    if (isConsultationMode && currentStep === "pipeLength") {
      setCurrentStep("fitting");
    }
  }, [isConsultationMode, currentStep]);

  const handlePrevious = useCallback(() => {
    if (currentStep === "fitting") setCurrentStep("pipeLength");
  }, [currentStep]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setTimeout(() => {
      setOnVerificationComplete(null);
      setError(null);
      setIsConsultationMode(false);
      dispatch({ type: "reset" });
    }, 300);
  }, []);

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
