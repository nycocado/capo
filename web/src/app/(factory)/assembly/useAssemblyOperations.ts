import {useState, useCallback} from 'react';
import {UseAssemblyOperationsProps} from "@/app/(factory)/assembly/useAssemblyOperations.types";
import {API_ROUTES} from "@/routes";
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export function useAssemblyOperations({onSuccess, onError}: UseAssemblyOperationsProps = {}) {
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
            onSuccess?.(result.weldId || result.id);
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

    const processWeld = useCallback(async (weldId: number, jointId: number) => {
        if (!weldId || weldId <= 0) {
            onError?.('Invalid weld ID');
            return false;
        }
        if (!jointId || jointId <= 0) {
            onError?.('Invalid joint ID');
            return false;
        }
        return performOperation(API_ROUTES.joint.assembly, {
            jointId: jointId,
        }, 'processing weld');
    }, [performOperation, onError]);

    return {
        processWeld,
        isSubmitting,
    };
}