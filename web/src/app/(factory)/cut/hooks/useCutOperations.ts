import { useState } from "react";
import { PipeLengthDto } from "@/dtos";
import { createPipeLengthStatusEvent } from "@/lib/api";

export interface UseCutOperationsProps {
  onSuccess?: (item: PipeLengthDto) => void;
  onError?: (error: string) => void;
}

/**
 * Operações de corte sobre um pipe-length, via `POST status-events`:
 * iniciar (to_do→in_progress, com heat number) e concluir (in_progress→done).
 */
export function useCutOperations({
  onSuccess,
  onError,
}: UseCutOperationsProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performOperation = async (
    operation: () => Promise<PipeLengthDto>,
    errorContext = "performing operation",
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const updatedItem = await operation();
      onSuccess?.(updatedItem);
      return true;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Unexpected error ${errorContext}`;
      onError?.(message);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  /** Inicia o corte: to_do → in_progress, registando o heat number. */
  const startWork = (
    item: { id: number },
    heatNumber: string,
  ): Promise<boolean> =>
    performOperation(
      () =>
        createPipeLengthStatusEvent(item.id, {
          status: "in_progress",
          heatNumber,
        }),
      "starting work",
    );

  /** Conclui o corte: in_progress → done. */
  const finishWork = (item: { id: number }): Promise<boolean> =>
    performOperation(
      () => createPipeLengthStatusEvent(item.id, { status: "done" }),
      "finishing work",
    );

  return { startWork, finishWork, isSubmitting };
}
