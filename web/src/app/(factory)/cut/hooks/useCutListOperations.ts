import { useCallback } from 'react';
import ky from 'ky';
import { API_ROUTES } from '@/routes';
import { CutListDto } from '@/dtos';

interface UseCutListOperationsProps {
  onSuccess?: (updatedCutList: CutListDto) => void;
  onError?: (error: string) => void;
}

export const useCutListOperations = ({
  onSuccess,
  onError,
}: UseCutListOperationsProps = {}) => {
  const setWorking = useCallback(
    async (cutListId: number): Promise<boolean> => {
      try {
        const response = await ky.patch(
          API_ROUTES.cutLists.setWorking(cutListId),
          {
            credentials: 'include',
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired. Please login again.');
          }
          throw new Error(`API Error: ${response.status}`);
        }

        const updatedCutList: CutListDto = await response.json();
        onSuccess?.(updatedCutList);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Unexpected error setting cut list to working';
        onError?.(errorMessage);
        return false;
      }
    },
    [onSuccess, onError],
  );

  return {
    setWorking,
  };
};
