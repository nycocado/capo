import { useState, useCallback } from "react";
import ky from "ky";
import { API_ROUTES } from "@/routes";
import { JointDto } from "@/dtos";

const API_ERRORS = {
  UNAUTHORIZED: 401,
  SESSION_EXPIRED: "Session expired. Please login again.",
  INVALID_JOINT_ID: "Invalid joint ID",
} as const;

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
        onError?.(API_ERRORS.INVALID_JOINT_ID);
        return false;
      }

      setIsSubmitting(true);
      try {
        const response = await ky.patch<JointDto>(
          API_ROUTES.joints.step(jointId),
          { credentials: "include" },
        );

        if (!response.ok) {
          if (response.status === API_ERRORS.UNAUTHORIZED) {
            throw new Error(API_ERRORS.SESSION_EXPIRED);
          }
          throw new Error(`API Error: ${response.status}`);
        }

        const updatedJoint = await response.json<JointDto>();
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
