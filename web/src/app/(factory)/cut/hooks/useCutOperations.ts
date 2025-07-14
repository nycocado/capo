import { useState, useCallback } from 'react';
import { API_ROUTES } from '@/routes';
import { VALIDATION } from '../constants';
import ky from 'ky';
import { PipeLengthDto } from '@/dtos';

const API_ERRORS = {
  UNAUTHORIZED: 401,
  SESSION_EXPIRED: 'Session expired. Please login again.',
  INVALID_HEAT_NUMBER: 'Please enter a valid heat number',
} as const;

export interface UseCutOperationsProps {
  onSuccess?: (item: PipeLengthDto) => void;
  onError?: (error: string) => void;
}

export function useCutOperations({
  onSuccess,
  onError,
}: UseCutOperationsProps = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const performOperation = useCallback(
    async (
      route: string,
      params?: Record<string, string | number>,
      errorContext = 'performing operation',
    ): Promise<boolean> => {
      setIsSubmitting(true);
      try {
        const response = await ky.patch(route, {
          credentials: 'include',
          searchParams: params,
        });

        if (!response.ok) {
          if (response.status === API_ERRORS.UNAUTHORIZED) {
            throw new Error(API_ERRORS.SESSION_EXPIRED);
          }
          throw new Error(`API Error: ${response.status}`);
        }

        const updatedItem = await response.json<PipeLengthDto>();
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
    },
    [onSuccess, onError],
  );

  const validateHeatNumber = useCallback((heatNumber: number): boolean => {
    return (
      Number.isInteger(heatNumber) && heatNumber >= VALIDATION.HEAT_NUMBER_MIN
    );
  }, []);

  const startWork = useCallback(
    async (item: PipeLengthDto, heatNumber: number): Promise<boolean> => {
      if (!validateHeatNumber(heatNumber)) {
        onError?.(API_ERRORS.INVALID_HEAT_NUMBER);
        return false;
      }

      return performOperation(
        API_ROUTES.pipeLengths.step(item.id),
        { heatNumber: heatNumber.toString() },
        'starting work',
      );
    },
    [performOperation, onError, validateHeatNumber],
  );

  const finishWork = useCallback(
    async (item: PipeLengthDto): Promise<boolean> => {
      return performOperation(
        API_ROUTES.pipeLengths.step(item.id),
        undefined,
        'finishing work',
      );
    },
    [performOperation],
  );

  const editHeatNumber = useCallback(
    async (item: PipeLengthDto, heatNumber: number): Promise<boolean> => {
      if (!validateHeatNumber(heatNumber)) {
        onError?.(API_ERRORS.INVALID_HEAT_NUMBER);
        return false;
      }

      return performOperation(
        API_ROUTES.pipeLengths.heatNumber(item.id),
        { heatNumber: heatNumber.toString() },
        'editing heat number',
      );
    },
    [performOperation, onError, validateHeatNumber],
  );

  return {
    startWork,
    finishWork,
    editHeatNumber,
    isSubmitting,
  };
}
