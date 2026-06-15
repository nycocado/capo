import { useState, useCallback } from "react";
import { WeldWithContext } from "@interfaces/weld-with-context.interface";
import {
  setWeldFillerMaterial,
  setWeldWps,
  stepWeld,
  type WeldStepParams,
} from "@/lib/api";

const API_ERRORS = {
  INVALID_WPS: "Please select a valid WPS",
  INVALID_FILLER: "Please select a valid filler material",
} as const;

type WeldState = "to-do" | "finished";

// Props interface
export interface UseWeldOperationsProps {
  onSuccess?: (item: WeldWithContext) => void;
  onError?: (error: string) => void;
  onAllFinished?: () => void;
  onWeldRequiresData?: (
    weld: WeldWithContext,
  ) => Promise<{ wps?: string; fillerMaterial?: string } | null>;
}

// Hook for weld operations
export function useWeldOperations({
  onSuccess,
  onError,
  onAllFinished,
  onWeldRequiresData,
}: UseWeldOperationsProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedWeld, setSelectedWeld] = useState<WeldWithContext | null>(
    null,
  );

  // Get weld state - baseado apenas no workStatus da API
  const getWeldState = useCallback((weld: WeldWithContext): WeldState => {
    const statusName = weld.workStatus?.name?.toLowerCase();

    if (statusName === "finished" || statusName === "completed") {
      return "finished";
    }
    return "to-do";
  }, []);

  const performOperation = async (
    operation: () => Promise<WeldWithContext>,
    errorContext = "performing operation",
  ): Promise<WeldWithContext | null> => {
    setIsSubmitting(true);
    try {
      const updatedItem = await operation();
      onSuccess?.(updatedItem);
      return updatedItem;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Unexpected error ${errorContext}`;
      onError?.(errorMessage);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle weld click - agora intercepta para coletar dados se necessário
  const handleWeldClick = useCallback(
    async (weld: WeldWithContext, fillerMaterial?: string, wps?: string) => {
      if (isSubmitting) return;

      const currentState = getWeldState(weld);
      setSelectedWeld(weld);

      // Se já está finished, apenas seleciona para visualização
      if (currentState === "finished") {
        return;
      }

      // Se está to-do, verifica se precisa coletar dados via modal
      if (currentState === "to-do") {
        let finalFillerMaterial = fillerMaterial;
        let finalWps = wps;

        // Se não tem os dados e existe callback para coletar, chama o modal
        if ((!fillerMaterial || !wps) && onWeldRequiresData) {
          const modalResult = await onWeldRequiresData(weld);
          if (!modalResult) {
            // User cancelou o modal
            return;
          }
          finalFillerMaterial = modalResult.fillerMaterial || fillerMaterial;
          finalWps = modalResult.wps || wps;
        }

        // Monta parâmetros para a API
        const params: WeldStepParams = {};
        if (finalFillerMaterial) params.fillerMaterial = finalFillerMaterial;
        if (finalWps) params.wps = finalWps;

        await performOperation(
          () => stepWeld(weld.id, params),
          "processing weld step",
        );
      }
    },
    [isSubmitting, getWeldState, onWeldRequiresData],
  );

  // Handle next weld
  const handleNextWeld = useCallback(
    async (weldItems: WeldWithContext[]) => {
      const nextWeld = weldItems.find((weld) => getWeldState(weld) === "to-do");
      if (nextWeld && !isSubmitting) {
        // Para handleNextWeld, pode chamar sem parâmetros ou com lógica específica
        await handleWeldClick(nextWeld);
      } else if (!nextWeld) {
        onAllFinished?.();
      }
    },
    [getWeldState, handleWeldClick, isSubmitting, onAllFinished],
  );

  // Check if all welds are finished
  const areAllWeldsFinished = useCallback(
    (weldItems: WeldWithContext[]) => {
      if (weldItems.length === 0) return false;
      return weldItems.every((weld) => getWeldState(weld) === "finished");
    },
    [getWeldState],
  );

  // Update WPS
  const updateWPS = async (
    item: WeldWithContext,
    wps: string,
  ): Promise<boolean> => {
    if (!wps) {
      onError?.(API_ERRORS.INVALID_WPS);
      return false;
    }

    const result = await performOperation(
      () => setWeldWps(item.id, wps),
      "updating WPS",
    );
    return result !== null;
  };

  // Update Filler Material
  const updateFillerMaterial = async (
    item: WeldWithContext,
    fillerMaterial: string,
  ): Promise<boolean> => {
    if (!fillerMaterial) {
      onError?.(API_ERRORS.INVALID_FILLER);
      return false;
    }

    const result = await performOperation(
      () => setWeldFillerMaterial(item.id, fillerMaterial),
      "updating filler material",
    );
    return result !== null;
  };

  // Item states for WorkGrid - removendo onClick interno para forçar uso de handleItemClick externo
  const itemStates = {
    "to-do": {
      className: isSubmitting
        ? "bg-secondary text-white"
        : "bg-dark text-light",
      // Removendo onClick - o WorkGrid deve usar handleItemClick ao invés de itemStates.onClick
    },
    finished: {
      className: "bg-success text-white",
      // Removendo onClick - o WorkGrid deve usar handleItemClick
    },
  };

  const itemStateAccessor = useCallback(
    (item: WeldWithContext) => {
      return getWeldState(item);
    },
    [getWeldState],
  );

  return {
    isSubmitting,
    selectedWeld,
    handleWeldClick,
    handleNextWeld,
    areAllWeldsFinished,
    itemStates,
    itemStateAccessor,
    updateWPS,
    updateFillerMaterial,
  };
}
