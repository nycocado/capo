import { useState, useRef, useCallback } from "react";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pendingRef = useRef(false);

  const processJoint = useCallback(
    async (jointId: number): Promise<boolean> => {
      if (!jointId) {
        onError?.(INVALID_JOINT_ID);
        return false;
      }
      if (pendingRef.current) return false;
      pendingRef.current = true;
      setIsSubmitting(true);
      try {
        const updatedJoint = await createJointStatusEvent(jointId, {
          status: "done",
        });
        onSuccess?.(updatedJoint);
        return true;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unexpected error processing joint";
        onError?.(message);
        return false;
      } finally {
        pendingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [onSuccess, onError],
  );

  return { processJoint, isSubmitting };
}
