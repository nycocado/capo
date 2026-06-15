import { useCallback } from "react";
import { browserApi } from "@/lib/api";

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
        const updatedItem = await browserApi
          .patch(setWorkingUrl(itemId))
          .json<T>();
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
