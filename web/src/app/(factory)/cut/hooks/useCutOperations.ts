import { useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { PipeLengthDto } from "@dtos";
import { createPipeLengthStatusEvent } from "@/lib/api";

export interface UseCutOperationsProps {
  onSuccess?: (item: PipeLengthDto) => void;
  onError?: (error: string) => void;
}

export function useCutOperations({
  onSuccess,
  onError,
}: UseCutOperationsProps = {}) {
  const pendingRef = useRef(false);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (operation: () => Promise<PipeLengthDto>) => operation(),
    onSuccess: (item) => onSuccess?.(item),
    onError: (error) =>
      onError?.(error instanceof Error ? error.message : "Unexpected error"),
  });

  const run = async (
    operation: () => Promise<PipeLengthDto>,
  ): Promise<boolean> => {
    if (pendingRef.current) return false;
    pendingRef.current = true;
    try {
      await mutateAsync(operation);
      return true;
    } catch {
      return false;
    } finally {
      pendingRef.current = false;
    }
  };

  const startWork = (item: { id: number }, heatNumber: string) =>
    run(() =>
      createPipeLengthStatusEvent(item.id, {
        status: "in_progress",
        heatNumber,
      }),
    );

  const finishWork = (item: { id: number }) =>
    run(() => createPipeLengthStatusEvent(item.id, { status: "done" }));

  return { startWork, finishWork, isSubmitting: isPending };
}
