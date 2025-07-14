import { useCallback } from 'react';
import ky from 'ky';
import { API_ROUTES } from '@/routes';
import { AssemblyListDto } from '@/dtos';

interface UseAssemblyListOperationsProps {
  onSuccess?: (updatedAssemblyList: AssemblyListDto) => void;
  onError?: (error: string) => void;
}

export const useAssemblyListOperations = ({
  onSuccess,
  onError,
}: UseAssemblyListOperationsProps = {}) => {
  const setWorking = useCallback(
    async (assemblyListId: number): Promise<boolean> => {
      try {
        const response = await ky.patch(
          API_ROUTES.assemblyLists.setWorking(assemblyListId),
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

        const updatedAssemblyList: AssemblyListDto = await response.json();
        onSuccess?.(updatedAssemblyList);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Unexpected error setting assembly list to working';
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
