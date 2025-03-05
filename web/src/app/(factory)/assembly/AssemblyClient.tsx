"use client";

import NavBar from "@components/layout/NavBar/NavBar";
import {Col, Container, Row} from "react-bootstrap";
import {assemblyButtonConfig} from "@components/features/factory/ControlPanel/ControlPanel.buttonConfig";
import {ControlPanel} from "@components/features/factory/ControlPanel";
import {tabsAllWorking, WorkTabs} from "@components/features/factory/WorkTabs";
import {WorkGrid} from "@components/features/factory/WorkGrid";
import {AssemblyClientProps} from "@/app/(factory)/assembly/AssemblyClient.types";
import {WorkTable} from "@components/features/WorkTable";
import {useAssemblyTable} from "./useAssemblyTable";
import PDFViewer from "@components/features/PDFViewer";
import {usePDFViewer} from "./usePDFViewer";
import {columnsAssembly} from "@components/features/WorkTable/WorkTable.columns";
import {MaterialVerificationModal} from "@components/layout/Modals/MaterialVerificationModal";
import {ErrorToast} from "@components/common/ErrorToast";
import {useState} from "react";

function AssemblyClient({initialItems, fetchError}: AssemblyClientProps) {
    // Error state for API operations - following cutting pattern
    const [errorMsg, setErrorMsg] = useState<string | null>(fetchError ?? null);

    const {
        activeTab,
        setActiveTab,
        search,
        setSearch,
        filteredRows,
        weldItems,
        selectedRow,
        handleSelectRow,
        rowStates,
        rowStateAccessor,
        itemStates,
        itemStateAccessor,
        materialVerification,
        handleWeldClick,
        handleListConsultation,
        handleNext,
        isSubmitting,
    } = useAssemblyTable(initialItems, {
        // Callbacks following cutting pattern
        onWeldProcessed: (weldId) => {
            console.log(`Weld ${weldId} processed successfully`);
        },
        onError: (error) => {
            setErrorMsg(error);
        }
    });

    const {pdfFile, loading, error} = usePDFViewer(selectedRow?.revId || null);

    // Function to open PDF in new tab
    const handleIsometricClick = () => {
        if (pdfFile && !loading && !error) {
            window.open(pdfFile, '_blank');
        } else if (loading) {
            console.log('PDF is still loading...');
        } else if (error) {
            console.error('Cannot open PDF due to error:', error);
        } else {
            console.log('No PDF file available to open');
        }
    };

    const controlButtons = assemblyButtonConfig({
        onIsometricClick: handleIsometricClick,
        onListClick: handleListConsultation,
        onNoteClick: () => {},
        onReportClick: () => {},
        onNextClick: handleNext
    });

    // Show error state - following cutting pattern
    const showError = Boolean(errorMsg);

    return (
        <>
            <NavBar title="Assembling" fixed={true}/>
            <div
                className="d-flex justify-content-center align-items-center"
                style={{height: 'calc(100vh - 56px)'}}
            >
                <Container fluid className="mx-4">
                    <Row className="g-4">
                        <Col md={8} className="d-flex flex-column gap-3">
                            <PDFViewer pdfFile={pdfFile} loading={loading} error={error}/>
                            <ControlPanel
                                search={search}
                                setSearch={setSearch}
                                buttons={controlButtons}
                                tag="ISO"
                            />
                        </Col>
                        <Col md={4} className="d-flex flex-column gap-3">
                            <WorkTabs
                                tabs={tabsAllWorking}
                                activeTab={activeTab}
                                setActiveTab={(tab: string) => setActiveTab(tab as 'all' | 'working')}
                            />
                            {activeTab === 'all' ? (
                                <WorkTable
                                    items={filteredRows}
                                    columns={columnsAssembly}
                                    handleRowClick={handleSelectRow}
                                    rowStates={rowStates}
                                    rowStateAccessor={rowStateAccessor}
                                    defaultSortColumn="internalId"
                                    hover={false}
                                />
                            ) : (
                                <WorkGrid
                                    items={weldItems}
                                    accessor={item => `W.${item.id}`}
                                    handleItemClick={handleWeldClick}
                                    itemStates={itemStates}
                                    itemStateAccessor={itemStateAccessor}
                                    columns={3}
                                    groupBy={item => item.spoolInternalId}
                                    renderGroupTitle={(groupItems, gi) => (
                                        <div key={gi} className="text-white mb-3">
                                            <h4>{groupItems[0].spoolInternalId}</h4>
                                        </div>
                                    )}
                                />
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>

            <MaterialVerificationModal
                showModal={materialVerification.showModal}
                currentStep={materialVerification.currentStep}
                currentStepData={materialVerification.currentStepData}
                currentStepTitle={materialVerification.currentStepTitle}
                canContinue={materialVerification.canContinue}
                canGoToPrevious={materialVerification.canGoToPrevious}
                canGoToNext={materialVerification.canGoToNext}
                loading={materialVerification.loading}
                error={materialVerification.error}
                isConsultationMode={materialVerification.isConsultationMode}
                handlePipeLengthClick={materialVerification.handlePipeLengthClick}
                handleFittingClick={materialVerification.handleFittingClick}
                handleContinue={materialVerification.handleContinue}
                handleNext={materialVerification.handleNext}
                handlePrevious={materialVerification.handlePrevious}
                handleCancel={materialVerification.handleCancel}
                getPipeLengthState={materialVerification.getPipeLengthState}
                getFittingState={materialVerification.getFittingState}
            />

            {/* Error toast following cutting pattern */}
            <ErrorToast
                show={showError}
                message={errorMsg || ''}
                onClose={() => setErrorMsg(null)}
            />
        </>
    );
}

export default AssemblyClient;