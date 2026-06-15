import { useState, useCallback } from "react";
import { JointDto } from "@/dtos";
import { stepJoint } from "@/lib/api";

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

  const processJoint = useCallback(
    async (jointId: number): Promise<boolean> => {
      if (!jointId) {
        onError?.(INVALID_JOINT_ID);
        return false;
      }

      setIsSubmitting(true);
      try {
        const updatedJoint = await stepJoint(jointId);
        onSuccess?.(updatedJoint);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unexpected error processing joint";
        onError?.(errorMessage);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSuccess, onError],
  );

  return {
    processJoint,
    isSubmitting,
  };
}
