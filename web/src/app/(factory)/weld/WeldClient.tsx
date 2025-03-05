"use client";

import NavBar from "@components/layout/NavBar/NavBar";
import {Col, Container, Row} from "react-bootstrap";
import {weldButtonConfig} from "@components/features/factory/ControlPanel/ControlPanel.buttonConfig";
import {ControlPanel} from "@components/features/factory/ControlPanel";
import {tabsAllWorking, WorkTabs} from "@components/features/factory/WorkTabs";
import {WorkGrid} from "@components/features/factory/WorkGrid";
import {WorkPanel} from "@components/features/factory/WorkPanel";
import {WeldClientProps} from "./WeldClient.types";
import {WorkTable} from "@components/features/WorkTable";
import {useWeldTable} from "./useWeldTable";
import {columnsWeld} from "@components/features/WorkTable/WorkTable.columns";
import {weldCardConfigs} from "@components/features/factory/WorkPanel/WorkPanel.cardConfigs";
import {ErrorToast} from "@components/common/ErrorToast";
import {useState} from "react";
import {FormModal} from "@components/layout/Modals/FormModal";
import {useWPSViewer} from './useWPSViewer';

function WeldClient({initialItems, fetchError}: WeldClientProps) {
    const [errorMsg, setErrorMsg] = useState<string | null>(fetchError ?? null);

    const {
        activeTab,
        setActiveTab,
        search,
        setSearch,
        filteredRows,
        weldItems,
        selectedRow,
        selectedWeld,
        handleSelectRow,
        rowStates,
        rowStateAccessor,
        itemStates,
        itemStateAccessor,
        formModal,
        handleWeldClick,
        handleNext,
        isSubmitting,
    } = useWeldTable(initialItems, {
        onWeldProcessed: (weldId) => {
            console.log(`Weld ${weldId} processed successfully`);
        },
        onError: (error) => {
            setErrorMsg(error);
        }
    });

    const {wpsFile, loading: wpsLoading, error: wpsError} = useWPSViewer(selectedWeld?.wps?.id || null);

    // Function to open WPS PDF in new tab
    const handleWPSClick = () => {
        if (!selectedWeld) return;
        if (wpsFile && !wpsLoading && !wpsError) {
            window.open(wpsFile, '_blank');
        } else if (wpsLoading) {
            console.log('WPS PDF is still loading...');
        } else if (wpsError) {
            console.error('Cannot open WPS PDF due to error:', wpsError);
        } else {
            console.log('No WPS PDF available to open');
        }
    };

    // Check if WPS/Filler can be edited
    const canEditWpsOrFiller = selectedWeld && itemStateAccessor(selectedWeld) === 'finished';

    const cards = weldCardConfigs(selectedRow, selectedWeld, {
        onWPSClick: canEditWpsOrFiller ? () => formModal.openEdit(selectedWeld.id, 'wps') : undefined,
        onFillerClick: canEditWpsOrFiller ? () => formModal.openEdit(selectedWeld.id, 'filler') : undefined
    });

    const controlButtons = weldButtonConfig({
        onWpsClick: handleWPSClick,
        onNoteClick: () => {},
        onReportClick: () => {},
        onNextClick: handleNext
    });

    const showError = Boolean(errorMsg);

    return (
        <>
            <NavBar title="Welding" fixed={true}/>
            <div
                className="d-flex justify-content-center align-items-center"
                style={{height: 'calc(100vh - 56px)'}}
            >
                <Container fluid className="mx-4">
                    <Row className="g-4">
                        <Col md={5} className="d-flex flex-column gap-3">
                            <WorkPanel cards={cards}/>
                            <ControlPanel
                                search={search}
                                setSearch={setSearch}
                                buttons={controlButtons}
                                tag="SPO"
                            />
                        </Col>
                        <Col md={7} className="d-flex flex-column gap-3">
                            <WorkTabs
                                tabs={tabsAllWorking}
                                activeTab={activeTab}
                                setActiveTab={(tab: string) => setActiveTab(tab as 'all' | 'working')}
                            />
                            {activeTab === 'all' ? (
                                <WorkTable
                                    items={filteredRows}
                                    columns={columnsWeld}
                                    handleRowClick={handleSelectRow}
                                    rowStates={rowStates}
                                    rowStateAccessor={rowStateAccessor}
                                    defaultSortColumn="spoolInternalId"
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

            <FormModal
                showModal={formModal.showModal}
                title={formModal.title}
                fields={formModal.fields}
                values={formModal.values}
                loading={formModal.loading}
                error={formModal.error}
                handleFieldChange={formModal.handleFieldChange}
                handleSubmit={formModal.handleSubmit}
                handleCancel={formModal.handleCancel}
                submitText={formModal.submitText}
            />

            <ErrorToast
                show={showError}
                message={errorMsg || ''}
                onClose={() => setErrorMsg(null)}
            />
        </>
    );
}

export default WeldClient;

