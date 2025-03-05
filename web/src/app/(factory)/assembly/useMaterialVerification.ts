import {useState, useMemo, useCallback, useReducer} from 'react';
import Cookies from 'js-cookie';
import {
    MaterialsResponse, MaterialState,
    VerificationAction,
    VerificationState,
    VerificationStep
} from './useMaterialVerification.types';
import {PipeLength} from "@models/pipe-length.interface";
import {Fitting} from "@models/fitting.interface";
import {API_ROUTES} from "@/routes";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

const verificationReducer = (state: VerificationState, action: VerificationAction): VerificationState => {
    switch (action.type) {
        case 'togglePipeLength': {
            const currentState = state.pipeLengthStates[action.id] || 'initial';
            return {
                ...state,
                pipeLengthStates: {
                    ...state.pipeLengthStates,
                    [action.id]: currentState === 'initial' ? 'finished' : 'initial'
                }
            };
        }
        case 'toggleFitting': {
            const currentState = state.fittingStates[action.id] || 'initial';
            return {
                ...state,
                fittingStates: {
                    ...state.fittingStates,
                    [action.id]: currentState === 'initial' ? 'finished' : 'initial'
                }
            };
        }
        case 'reset': {
            return {
                pipeLengthStates: {},
                fittingStates: {}
            };
        }
        default:
            return state;
    }
};

async function fetchMaterialsForIsometric(isometricId: number): Promise<MaterialsResponse> {
    const token = Cookies.get('token');

    const [pipeLengthResponse, fittingResponse] = await Promise.all([
        fetch(`${API_URL}${API_ROUTES.pipeLength.assembly(isometricId)}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        }),
        fetch(`${API_URL}${API_ROUTES.fitting.assembly(isometricId)}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        })
    ]);

    if (!pipeLengthResponse.ok || !fittingResponse.ok) {
        throw new Error('Failed to fetch materials');
    }

    const [pipeLengthData, fittingData] = await Promise.all([
        pipeLengthResponse.json(),
        fittingResponse.json()
    ]);

    return {
        pipeLengths: pipeLengthData || [],
        fittings: fittingData || []
    };
}

export function useMaterialVerification() {
    const [showModal, setShowModal] = useState(false);
    const [currentStep, setCurrentStep] = useState<VerificationStep>('pipeLength');
    const [materials, setMaterials] = useState<MaterialsResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [onVerificationComplete, setOnVerificationComplete] = useState<(() => void) | null>(null);
    const [isConsultationMode, setIsConsultationMode] = useState(false);

    const [state, dispatch] = useReducer(verificationReducer, {
        pipeLengthStates: {},
        fittingStates: {}
    });

    // Check verification status
    const allPipeLengthsVerified = useMemo(() => {
        if (!materials?.pipeLengths.length) return true;
        return materials.pipeLengths.every(pipeLength =>
            state.pipeLengthStates[pipeLength.internalId] === 'finished'
        );
    }, [materials?.pipeLengths, state.pipeLengthStates]);

    const allFittingsVerified = useMemo(() => {
        if (!materials?.fittings.length) return true;
        return materials.fittings.every(fitting =>
            state.fittingStates[fitting.internalId] === 'finished'
        );
    }, [materials?.fittings, state.fittingStates]);

    const canContinue = useMemo(() => {
        if (isConsultationMode) return false;
        return currentStep === 'pipeLength' ? allPipeLengthsVerified : allFittingsVerified;
    }, [currentStep, allPipeLengthsVerified, allFittingsVerified, isConsultationMode]);

    // Check if we can go to previous step
    const canGoToPrevious = useMemo(() => {
        return currentStep === 'fitting';
    }, [currentStep]);

    // Check if we can navigate to next step in consultation mode - garantindo que sempre retorne boolean
    const canGoToNext = useMemo(() => {
        if (!isConsultationMode) return false;
        return currentStep === 'pipeLength' && !!(materials?.fittings && materials.fittings.length > 0);
    }, [isConsultationMode, currentStep, materials?.fittings]);

    // Start verification
    const startVerification = useCallback(async (isometricId: number, onComplete: () => void) => {
        setLoading(true);
        setError(null);
        setOnVerificationComplete(() => onComplete);
        setIsConsultationMode(false);
        dispatch({type: 'reset'});

        try {
            const fetchedMaterials = await fetchMaterialsForIsometric(isometricId);
            setMaterials(fetchedMaterials);
            setCurrentStep('pipeLength');
            setShowModal(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch materials');
        } finally {
            setLoading(false);
        }
    }, []);

    // Open materials for consultation (read-only mode)
    const openMaterialsConsultation = useCallback(async (isometricId: number) => {
        setLoading(true);
        setError(null);
        setOnVerificationComplete(null);
        setIsConsultationMode(true);

        try {
            const fetchedMaterials = await fetchMaterialsForIsometric(isometricId);
            setMaterials(fetchedMaterials);
            setCurrentStep('pipeLength');
            setShowModal(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch materials');
        } finally {
            setLoading(false);
        }
    }, []);

    // Handle clicks (disabled in consultation mode)
    const handlePipeLengthClick = useCallback((pipeLength: PipeLength) => {
        if (isConsultationMode) return;
        if (pipeLength?.internalId) {
            dispatch({type: 'togglePipeLength', id: pipeLength.internalId});
        }
    }, [isConsultationMode]);

    const handleFittingClick = useCallback((fitting: Fitting) => {
        if (isConsultationMode) return;
        if (fitting?.internalId) {
            dispatch({type: 'toggleFitting', id: fitting.internalId});
        }
    }, [isConsultationMode]);

    // Continue to next step or complete (verification mode only)
    const handleContinue = useCallback(() => {
        if (isConsultationMode) return;

        if (currentStep === 'pipeLength' && allPipeLengthsVerified) {
            if (materials?.fittings.length) {
                setCurrentStep('fitting');
            } else {
                setShowModal(false);
                onVerificationComplete?.();
                setOnVerificationComplete(null);
            }
        } else if (currentStep === 'fitting' && allFittingsVerified) {
            setShowModal(false);
            onVerificationComplete?.();
            setOnVerificationComplete(null);
        }
    }, [currentStep, allPipeLengthsVerified, allFittingsVerified, materials?.fittings.length, onVerificationComplete, isConsultationMode]);

    // Navigate between steps in consultation mode
    const handleNext = useCallback(() => {
        if (isConsultationMode && currentStep === 'pipeLength') {
            setCurrentStep('fitting');
        }
    }, [isConsultationMode, currentStep]);

    const handlePrevious = useCallback(() => {
        if (currentStep === 'fitting') {
            setCurrentStep('pipeLength');
        }
    }, [currentStep]);

    // Cancel/Close modal - modificado para evitar mudança rápida de título
    const handleCancel = useCallback(() => {
        setShowModal(false);
        // Delay o reset para depois que o modal fechar completamente
        setTimeout(() => {
            setOnVerificationComplete(null);
            setError(null);
            setIsConsultationMode(false);
            dispatch({type: 'reset'});
        }, 300); // Tempo suficiente para a animação do modal terminar
    }, []);

    // Get states (always return 'initial' in consultation mode)
    const getPipeLengthState = useCallback((pipeLength: PipeLength): MaterialState => {
        if (isConsultationMode) return 'initial';
        return pipeLength?.internalId ?
            (state.pipeLengthStates[pipeLength.internalId] || 'initial') :
            'initial';
    }, [state.pipeLengthStates, isConsultationMode]);

    const getFittingState = useCallback((fitting: Fitting): MaterialState => {
        if (isConsultationMode) return 'initial';
        return fitting?.internalId ?
            (state.fittingStates[fitting.internalId] || 'initial') :
            'initial';
    }, [state.fittingStates, isConsultationMode]);

    // Current step data and title
    const currentStepData = useMemo(() => {
        if (!materials) return [];
        return currentStep === 'pipeLength' ? materials.pipeLengths : materials.fittings;
    }, [materials, currentStep]);

    const currentStepTitle = useMemo(() => {
        const stepNames = {
            pipeLength: 'Pipe Length List',
            fitting: 'Fitting List'
        };
        return isConsultationMode ? stepNames[currentStep] :
            (currentStep === 'pipeLength' ? 'Pipe Length Verification' : 'Fitting Verification');
    }, [currentStep, isConsultationMode]);

    return {
        showModal,
        currentStep,
        currentStepData,
        currentStepTitle,
        canContinue,
        canGoToPrevious,
        canGoToNext,
        loading,
        error,
        isConsultationMode,
        startVerification,
        openMaterialsConsultation,
        handlePipeLengthClick,
        handleFittingClick,
        handleContinue,
        handleNext,
        handlePrevious,
        handleCancel,
        getPipeLengthState,
        getFittingState
    };
}