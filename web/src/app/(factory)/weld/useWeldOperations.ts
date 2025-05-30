import {useState, useCallback} from 'react';
import {API_ROUTES} from "@/routes";
import Cookies from 'js-cookie';
import {Wps} from "@models/wps.interface";
import {FillerMaterial} from "@models/filler-material.interface";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

interface UseWeldOperationsProps {
    onSuccess?: (weldId: number, wpsData?: Wps, fillerData?: FillerMaterial) => void;
    onError?: (error: string) => void;
}

export function useWeldOperations({onSuccess, onError}: UseWeldOperationsProps = {}) {
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
            onSuccess?.(result.weldId || result.id, result.wps, result.filler);
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

    const fetchOptions = useCallback(async (endpoint: string) => {
        try {
            const token = Cookies.get('token');
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch options');
            }

            return await response.json();
        } catch (error) {
            onError?.(error instanceof Error ? error.message : 'Failed to fetch options');
            return [];
        }
    }, [onError]);

    const fetchWpsOptions = useCallback(async () => {
        const wpsData = await fetchOptions(API_ROUTES.wps.weld);
        return wpsData.map((wps: Wps) => ({
            label: `${wps.internalId}`,
            value: wps.id.toString()
        }));
    }, [fetchOptions]);

    const fetchFillerOptions = useCallback(async () => {
        const fillerData = await fetchOptions(API_ROUTES.filler.weld);
        return fillerData.map((filler: FillerMaterial) => ({
            label: filler.name,
            value: filler.id.toString()
        }));
    }, [fetchOptions]);

    const processWeld = useCallback(async (weldId: number, wpsId: number, fillerMaterialId: number) => {
        return performOperation(API_ROUTES.weld.welding, {
            weldId,
            wpsId,
            fillerMaterialId,
        }, 'processing weld');
    }, [performOperation]);

    const editWps = useCallback(async (weldId: number, wpsId: number) => {
        return performOperation(API_ROUTES.weld.editWps, {
            weldId,
            wpsId,
        }, 'editing WPS');
    }, [performOperation]);

    const editFillerMaterial = useCallback(async (weldId: number, fillerMaterialId: number) => {
        return performOperation(API_ROUTES.weld.editFillerMaterial, {
            weldId,
            fillerMaterialId,
        }, 'editing Filler Material');
    }, [performOperation]);

    return {
        fetchWpsOptions,
        fetchFillerOptions,
        processWeld,
        editWps,
        editFillerMaterial,
        isSubmitting,
    };
}