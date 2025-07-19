import { useCallback } from "react";
import ky from "ky";

// Generic interface for work list operations
interface UseWorkListOperationsProps<T> {
  onSuccess?: (updatedItem: T) => void;
  onError?: (error: string) => void;
}

// Generic hook for work list operations
export const useWorkListOperations = <T>(
  setWorkingUrl: (id: number) => string,
  errorContext: string,
  { onSuccess, onError }: UseWorkListOperationsProps<T> = {},
) => {
  // Set work list to working
  const setWorking = useCallback(
    async (itemId: number): Promise<boolean> => {
      try {
        const response = await ky.patch(setWorkingUrl(itemId), {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expired. Please login again.");
          }
          throw new Error(`API Error: ${response.status}`);
        }

        const updatedItem: T = await response.json();
        onSuccess?.(updatedItem);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : `Unexpected error ${errorContext}`;
        onError?.(errorMessage);
        return false;
      }
    },
    [setWorkingUrl, errorContext, onSuccess, onError],
  );

  return {
    setWorking,
  };
};
