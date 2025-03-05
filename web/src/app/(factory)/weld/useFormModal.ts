import {useState, useCallback, useMemo} from 'react';
import {useWeldOperations} from './useWeldOperations';

interface UseFormModalProps {
    processWeld: (weldId: number, wpsId: number, fillerId: number) => Promise<boolean>;
    editWps: (weldId: number, wpsId: number) => Promise<boolean>;
    editFillerMaterial: (weldId: number, fillerId: number) => Promise<boolean>;
    onError?: (error: string) => void;
}

export function useFormModal({processWeld, editWps, editFillerMaterial, onError}: UseFormModalProps) {
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'process' | 'edit-wps' | 'edit-filler' | null>(null);
    const [currentWeldId, setCurrentWeldId] = useState<number | null>(null);
    const [values, setValues] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {fetchWpsOptions, fetchFillerOptions} = useWeldOperations();
    const [wpsOptions, setWpsOptions] = useState<Array<{ label: string; value: string }>>([]);
    const [fillerOptions, setFillerOptions] = useState<Array<{ label: string; value: string }>>([]);

    const loadOptions = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const [wpsOpts, fillerOpts] = await Promise.all([
                fetchWpsOptions(),
                fetchFillerOptions()
            ]);

            setWpsOptions(wpsOpts);
            setFillerOptions(fillerOpts);
        } catch (err) {
            setError('Failed to load options');
        } finally {
            setLoading(false);
        }
    }, [fetchWpsOptions, fetchFillerOptions]);

    const openProcess = useCallback((weldId: number) => {
        setCurrentWeldId(weldId);
        setModalType('process');
        setValues({});
        setError(null);
        setShowModal(true);
        loadOptions();
    }, [loadOptions]);

    const openEdit = useCallback((weldId: number, editType: 'wps' | 'filler') => {
        setCurrentWeldId(weldId);
        setModalType(editType === 'wps' ? 'edit-wps' : 'edit-filler');
        setValues({});
        setError(null);
        setShowModal(true);
        loadOptions();
    }, [loadOptions]);

    const handleFieldChange = useCallback((fieldId: string, value: string) => {
        setValues(prev => ({...prev, [fieldId]: value}));
    }, []);

    const handleCancel = useCallback(() => {
        setShowModal(false);
        setCurrentWeldId(null);
        setModalType(null);
        setValues({});
        setError(null);
        setLoading(false);
    }, []);

    const handleSubmit = useCallback(async () => {
        if (!currentWeldId) return;

        setLoading(true);
        setError(null);

        try {
            let success = false;

            switch (modalType) {
                case 'process':
                    const wpsId = parseInt(values.wps || '');
                    const fillerId = parseInt(values.filler || '');
                    if (!wpsId || !fillerId) {
                        throw new Error('Please select both WPS and Filler Material');
                    }
                    success = await processWeld(currentWeldId, wpsId, fillerId);
                    break;

                case 'edit-wps':
                    const editWpsId = parseInt(values.wps || '');
                    if (!editWpsId) {
                        throw new Error('Please select a WPS');
                    }
                    success = await editWps(currentWeldId, editWpsId);
                    break;

                case 'edit-filler':
                    const editFillerId = parseInt(values.filler || '');
                    if (!editFillerId) {
                        throw new Error('Please select a Filler Material');
                    }
                    success = await editFillerMaterial(currentWeldId, editFillerId);
                    break;
            }

            if (success) {
                handleCancel();
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Operation failed';
            setError(errorMsg);
            onError?.(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [currentWeldId, modalType, values, processWeld, editWps, editFillerMaterial, onError, handleCancel]);

    const fields = useMemo(() => {
        const baseFields = [];

        if (modalType === 'process' || modalType === 'edit-wps') {
            baseFields.push({
                id: 'wps',
                label: 'WPS',
                type: 'select' as const,
                required: true,
                options: wpsOptions,
                placeholder: 'Select WPS...'
            });
        }

        if (modalType === 'process' || modalType === 'edit-filler') {
            baseFields.push({
                id: 'filler',
                label: 'Filler Material',
                type: 'select' as const,
                required: true,
                options: fillerOptions,
                placeholder: 'Select Filler Material...'
            });
        }

        return baseFields;
    }, [modalType, wpsOptions, fillerOptions]);

    const title = useMemo(() => {
        switch (modalType) {
            case 'process': return 'Process Weld';
            case 'edit-wps': return 'Edit WPS';
            case 'edit-filler': return 'Edit Filler Material';
            default: return 'Weld Form';
        }
    }, [modalType]);

    const submitText = useMemo(() => {
        return modalType === 'process' ? 'Process' : 'Update';
    }, [modalType]);

    return {
        showModal,
        title,
        fields,
        values,
        loading,
        error,
        submitText,
        openProcess,
        openEdit,
        handleFieldChange,
        handleSubmit,
        handleCancel
    };
}

