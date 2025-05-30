import {useState, useCallback} from 'react';
import {PipeLength} from '@models/pipe-length.interface';
import {UseCuttingOperationsProps} from "@/app/(factory)/cut/useCuttingOperations.types";
import {API_ROUTES} from "@/routes";
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function useCuttingOperations({onSuccess, onError}: UseCuttingOperationsProps = {}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const performOperation = useCallback(async (route: string, body: object, errorContext: string) => {
        setIsSubmitting(true);
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${API_URL}${route}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                if (response.status === 401) {
                    throw new Error('Session expired. Please login again.');
                }
                throw new Error(errorData.message || `API Error: ${response.status}`);
            }

            const result = await response.json();
            onSuccess?.(result);
            return true;

        } catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : `Unexpected error ${errorContext}`;
            onError?.(errorMessage);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    }, [onSuccess, onError]);

    const startWork = useCallback(async (item: PipeLength, heatNumber: number) => {
        if (!heatNumber || heatNumber <= 0) {
            onError?.('Please enter a valid heat number');
            return false;
        }
        return performOperation(API_ROUTES.pipeLength.cut, {
            pipeLengthId: item.id,
            heatNumber: heatNumber.toString(),
        }, 'starting work');
    }, [performOperation, onError]);

    const editHeatNumber = useCallback(async (item: PipeLength, heatNumber: number) => {
        if (!heatNumber || heatNumber <= 0) {
            onError?.('Please enter a valid heat number');
            return false;
        }
        return performOperation(API_ROUTES.pipeLength.editHeatNumber, {
            pipeLengthId: item.id,
            heatNumber: heatNumber.toString(),
        }, 'editing heat number');
    }, [performOperation, onError]);

    return {
        startWork,
        editHeatNumber,
        isSubmitting,
    };
}

