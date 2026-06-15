import { useState } from "react";
import { PipeLengthDto } from "@/dtos";
import { VALIDATION } from "@/constants";
import { setPipeLengthHeatNumber, stepPipeLength } from "@/lib/api";

const INVALID_HEAT_NUMBER = "Please enter a valid heat number";

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
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Unexpected error ${errorContext}`;
      onError?.(errorMessage);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateHeatNumber = (heatNumber: number): boolean => {
    return (
      Number.isInteger(heatNumber) && heatNumber >= VALIDATION.HEAT_NUMBER_MIN
    );
  };

  const startWork = async (
    item: PipeLengthDto,
    heatNumber: number,
  ): Promise<boolean> => {
    if (!validateHeatNumber(heatNumber)) {
      onError?.(INVALID_HEAT_NUMBER);
      return false;
    }
    return performOperation(
      () => stepPipeLength(item.id, heatNumber),
      "starting work",
    );
  };

  const finishWork = async (item: PipeLengthDto): Promise<boolean> => {
    return performOperation(() => stepPipeLength(item.id), "finishing work");
  };

  const editHeatNumber = async (
    item: PipeLengthDto,
    heatNumber: number,
  ): Promise<boolean> => {
    if (!validateHeatNumber(heatNumber)) {
      onError?.(INVALID_HEAT_NUMBER);
      return false;
    }
    return performOperation(
      () => setPipeLengthHeatNumber(item.id, heatNumber),
      "editing heat number",
    );
  };

  return {
    startWork,
    finishWork,
    editHeatNumber,
    isSubmitting,
  };
}
