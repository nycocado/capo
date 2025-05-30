import React from 'react';
import {Button} from 'react-bootstrap';
import {BaseModal} from '@components/layout/Modals/BaseModal';
import {WorkTable} from '@components/features/WorkTable/WorkTable';
import {
    columnsPipeLengthVerification,
    columnsFittingVerification
} from '@components/features/WorkTable/WorkTable.columns';
import {PipeLength} from '@models/pipe-length.interface';
import {Fitting} from '@models/fitting.interface';
import {MaterialVerificationModalProps} from "@components/layout/Modals/MaterialVerificationModal.types";

export function MaterialVerificationModal(props: MaterialVerificationModalProps) {
    const {
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
        handlePipeLengthClick,
        handleFittingClick,
        handleContinue,
        handleNext,
        handlePrevious,
        handleCancel,
        getPipeLengthState,
        getFittingState
    } = props;

    // Filtrar dados inválidos
    const validData = currentStepData?.filter(item =>
        item && (item.internalId || item.id)
    ) || [];

    // Handle material item click (only for verification mode)
    const handleMaterialClick = (item: any) => {
        if (isConsultationMode || !item?.internalId) return;

        if (currentStep === 'pipeLength') {
            handlePipeLengthClick(item as PipeLength);
        } else {
            handleFittingClick(item as Fitting);
        }
    };

    // Row states - different for consultation vs verification
    const materialRowStates = {
        initial: {
            className: 'bg-dark text-light',
            onClick: isConsultationMode ? undefined : handleMaterialClick
        },
        finished: {
            className: 'bg-success text-white',
            onClick: isConsultationMode ? undefined : handleMaterialClick
        }
    };

    // Row state accessor
    const materialRowStateAccessor = (item: any) => {
        if (!item?.internalId) return 'initial';

        // In consultation mode, all items are 'initial' (no green states)
        if (isConsultationMode) return 'initial';

        return currentStep === 'pipeLength'
            ? getPipeLengthState(item as PipeLength)
            : getFittingState(item as Fitting);
    };

    // Get columns
    const currentColumns = currentStep === 'pipeLength'
        ? columnsPipeLengthVerification
        : columnsFittingVerification;

    // Loading state
    if (loading) {
        return (
            <BaseModal show={showModal} onHide={handleCancel} title="Loading Materials..." size="lg">
                <BaseModal.Body className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 mb-0">Fetching material information...</p>
                </BaseModal.Body>
            </BaseModal>
        );
    }

    // Error state
    if (error) {
        return (
            <BaseModal show={showModal} onHide={handleCancel} title="Error Loading Materials" size="lg">
                <BaseModal.Body className="text-center py-4">
                    <div className="text-danger mb-3">
                        <i className="bi bi-exclamation-triangle-fill fs-1"></i>
                    </div>
                    <p className="mb-0">{error}</p>
                </BaseModal.Body>
                <BaseModal.Footer className="border-0 justify-content-center">
                    <Button variant="secondary" onClick={handleCancel} className="btn-lg px-4 text-white border-4">
                        Close
                    </Button>
                </BaseModal.Footer>
            </BaseModal>
        );
    }

    // Main modal content
    return (
        <BaseModal
            show={showModal}
            onHide={handleCancel}
            title={currentStepTitle}
            size="xl"
            contentClassName="bg-tertiary text-light rounded-3"
        >
            <BaseModal.Body className="p-0">
                <div className="bg-dark rounded-3 m-3">
                    <WorkTable
                        items={validData}
                        handleRowClick={() => {
                        }} // Empty handler since we use rowStates.onClick
                        columns={currentColumns}
                        defaultSortColumn={currentStep === 'pipeLength' ? 'id' : 'type'}
                        defaultSortDirection={null}
                        hover={false}
                        rowStates={materialRowStates}
                        rowStateAccessor={materialRowStateAccessor}
                    />
                </div>
            </BaseModal.Body>

            <BaseModal.Footer className="border-0 justify-content-between">
                {/* Left button */}
                <Button
                    variant="secondary"
                    onClick={canGoToPrevious ? handlePrevious : handleCancel}
                    className="btn-lg px-4 text-white border-4"
                >
                    {canGoToPrevious ? 'Previous' : (isConsultationMode ? 'Close' : 'Cancel')}
                </Button>

                {/* Right button */}
                {isConsultationMode ? (
                    // Consultation mode: show navigation or close
                    canGoToNext ? (
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            className="btn-lg px-4 text-black border-4"
                        >
                            View Fittings
                        </Button>
                    ) : null
                ) : (
                    // Verification mode: show continue button
                    <Button
                        variant="primary"
                        onClick={handleContinue}
                        disabled={!canContinue}
                        className="btn-lg px-4 text-black border-4"
                    >
                        {currentStep === 'pipeLength' && validData.length > 0 ? 'Continue to Fittings' : 'Start Working'}
                    </Button>
                )}
            </BaseModal.Footer>
        </BaseModal>
    );
}