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

export interface UseWeldOperationsProps {
  onSuccess?: (item: WeldWithContext) => void;
  onError?: (error: string) => void;
  onAllFinished?: () => void;
  onWeldRequiresData?: (
    weld: WeldWithContext,
  ) => Promise<{ wps?: string; fillerMaterial?: string } | null>;
}

/**
 * Gerencia as operações de avanço de welds: coleta de dados (WPS/filler material),
 * step via API e atualização de WPS ou filler material de forma independente.
 *
 * @param onSuccess Chamado com o weld atualizado após cada operação bem-sucedida.
 * @param onError Chamado com a mensagem de erro caso a operação falhe.
 * @param onAllFinished Chamado quando todos os welds da lista estão finished.
 * @param onWeldRequiresData Callback para coletar WPS/filler via modal antes do step.
 */
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

  const getWeldState = useCallback((weld: WeldWithContext): WeldState => {
    const statusName = weld.workStatus?.name?.toLowerCase();

    if (statusName === "finished" || statusName === "completed") {
      return "finished";
    }
    return "to-do";
  }, []);

  const performOperation = useCallback(
    async (
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
    },
    [onSuccess, onError],
  );

  const handleWeldClick = useCallback(
    async (weld: WeldWithContext, fillerMaterial?: string, wps?: string) => {
      if (isSubmitting) return;

      const currentState = getWeldState(weld);
      setSelectedWeld(weld);

      if (currentState === "finished") {
        return;
      }

      if (currentState === "to-do") {
        let finalFillerMaterial = fillerMaterial;
        let finalWps = wps;

        if ((!fillerMaterial || !wps) && onWeldRequiresData) {
          const modalResult = await onWeldRequiresData(weld);
          if (!modalResult) return;  // usuário cancelou o modal
          finalFillerMaterial = modalResult.fillerMaterial || fillerMaterial;
          finalWps = modalResult.wps || wps;
        }

        const params: WeldStepParams = {};
        if (finalFillerMaterial) params.fillerMaterial = finalFillerMaterial;
        if (finalWps) params.wps = finalWps;

        await performOperation(
          () => stepWeld(weld.id, params),
          "processing weld step",
        );
      }
    },
    [isSubmitting, getWeldState, onWeldRequiresData, performOperation],
  );

  const handleNextWeld = useCallback(
    async (weldItems: WeldWithContext[]) => {
      const nextWeld = weldItems.find((weld) => getWeldState(weld) === "to-do");
      if (nextWeld && !isSubmitting) {
        await handleWeldClick(nextWeld);
      } else if (!nextWeld) {
        onAllFinished?.();
      }
    },
    [getWeldState, handleWeldClick, isSubmitting, onAllFinished],
  );

  const areAllWeldsFinished = useCallback(
    (weldItems: WeldWithContext[]) => {
      if (weldItems.length === 0) return false;
      return weldItems.every((weld) => getWeldState(weld) === "finished");
    },
    [getWeldState],
  );

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

  // onClick omitido intencionalmente: o WorkGrid usa handleItemClick externo.
  const itemStates = {
    "to-do": {
      className: isSubmitting
        ? "bg-secondary text-white"
        : "bg-dark text-light",
    },
    finished: {
      className: "bg-success text-white",
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
