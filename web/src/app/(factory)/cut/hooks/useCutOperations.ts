import { useState } from "react";
import { PipeLengthDto } from "@/dtos";
import { createPipeLengthStatusEvent } from "@/lib/api";

export interface UseCutOperationsProps {
  onSuccess?: (item: PipeLengthDto) => void;
  onError?: (error: string) => void;
}

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

  const finishWork = (item: { id: number }): Promise<boolean> =>
    performOperation(
      () => createPipeLengthStatusEvent(item.id, { status: "done" }),
      "finishing work",
    );

  return { startWork, finishWork, isSubmitting };
}
