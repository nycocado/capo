import { useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { JointDto } from "@dtos";
import { createJointStatusEvent } from "@/lib/api";

const INVALID_JOINT_ID = "Invalid joint ID";

export interface UseAssemblyOperationsProps {
  onSuccess?: (updatedJoint: JointDto) => void;
  onError?: (error: string) => void;
}

export function useAssemblyOperations({
  onSuccess,
  onError,
}: UseAssemblyOperationsProps = {}) {
  const pendingRef = useRef(false);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (jointId: number) =>
      createJointStatusEvent(jointId, { status: "done" }),
    onSuccess: (updatedJoint) => onSuccess?.(updatedJoint),
    onError: (error) =>
      onError?.(
        error instanceof Error
          ? error.message
          : "Unexpected error processing joint",
      ),
  });

  const processJoint = useCallback(
    async (jointId: number): Promise<boolean> => {
      if (!jointId) {
        onError?.(INVALID_JOINT_ID);
        return false;
      }
      if (pendingRef.current) return false;
      pendingRef.current = true;
      try {
        await mutateAsync(jointId);
        return true;
      } catch {
        return false;
      } finally {
        pendingRef.current = false;
      }
    },
    [mutateAsync, onError],
  );

  return { processJoint, isSubmitting: isPending };
}
