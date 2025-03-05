"use client";

import {PipeLength} from "@models/pipe-length.interface";
import {useState} from "react";
import {useCuttingTable} from "./useCuttingTable";
import {useCuttingOperations} from "./useCuttingOperations";
import {cutCardConfigs} from "@components/features/factory/WorkPanel/WorkPanel.cardConfigs";
import {cutButtonConfig} from "@/components/features/factory/ControlPanel/ControlPanel.buttonConfig";
import NavBar from "@components/layout/NavBar/NavBar";
import {Col, Container, Row} from "react-bootstrap";
import {WorkPanel} from "@/components/features/factory/WorkPanel";
import {ControlPanel} from "@/components/features/factory/ControlPanel";
import {tabsAllWorking, WorkTabs} from "@components/features/factory/WorkTabs";
import {columnsPipeLength, WorkTable} from "@components/features/WorkTable";
import {InputModal} from "@components/layout/Modals";
import {ComponentLabelModal} from "@components/layout/Modals/ComponentLabelModal";
import {ErrorToast} from "@components/common/ErrorToast";
import {CutClientProps} from "@/app/(factory)/cut/CutClient.types";
import {cutCompletionModalConfig} from "@components/layout/Modals/ComponentLabelModal.valueConfig";

export default function CutClient({initialItems, fetchError}: CutClientProps) {
    const [errorMsg, setErrorMsg] = useState<string | null>(fetchError ?? null);
    const [items] = useState<PipeLength[]>(initialItems);
    const [activeTab, setActiveTab] = useState<'all' | 'working'>('all');
    const [search, setSearch] = useState<string>('');
    const [inputShow, setInputShow] = useState(false);
    const [pendingItem, setPendingItem] = useState<PipeLength | null>(null);
    const [heatNumbers, setHeatNumbers] = useState<Record<number, string>>({});
    const [isEditing, setIsEditing] = useState(false);
    const [inputValue, setInputValue] = useState<string>('');
    const [showCompletionModal, setShowCompletionModal] = useState(false);
    const [completedItem, setCompletedItem] = useState<PipeLength | null>(null);

    const {
        tableItems,
        rowStates,
        rowStateAccessor,
        selectedItem,
        handleRowClick,
        proceedToWorking,
        handleNextWorkflow,
        areAllWorkingItemsFinished
    } = useCuttingTable(items, activeTab, search, {
        onWorkingTransition: (item: PipeLength) => {
            setPendingItem(item);
            setIsEditing(false);
            setInputValue('');
            setInputShow(true);
        },
        onItemCompleted: (item: PipeLength) => {
            setCompletedItem(item);
            setShowCompletionModal(true);
        }
    });

    const {startWork, editHeatNumber, isSubmitting} = useCuttingOperations({
        onSuccess: (item) => {
            if (isEditing) {
                setHeatNumbers(prev => ({
                    ...prev,
                    [item.id]: inputValue
                }));
            } else {
                proceedToWorking(item.id);
            }
            handleInputHide();
        },
        onError: (error) => {
            setErrorMsg(error);
        }
    });

    const handleInputConfirm = async (inputHeatNumber: string) => {
        if (!pendingItem) return;

        const heatNumber = parseInt(inputHeatNumber);

        setHeatNumbers(prev => ({
            ...prev,
            [pendingItem.id]: inputHeatNumber
        }));

        if (isEditing) {
            await editHeatNumber(pendingItem, heatNumber);
        } else {
            await startWork(pendingItem, heatNumber);
        }
    };

    const handleInputHide = () => {
        setInputShow(false);
        setPendingItem(null);
        setIsEditing(false);
        setInputValue('');
    };

    const handleHeatNumberEdit = () => {
        if (!selectedItem) return;

        const currentHeatNumber = heatNumbers[selectedItem.id] || selectedItem.heatNumber || '';
        setPendingItem(selectedItem);
        setIsEditing(true);
        setInputValue(currentHeatNumber);
        setInputShow(true);
    };

    const handleCompletionModalHide = () => {
        setShowCompletionModal(false);
        setCompletedItem(null);
    };

    const handleCompletionModalConfirm = () => {
        handleCompletionModalHide();
    };

    // Handler do botão Next
    const handleNextClick = () => {
        if (activeTab === 'all') {
            // If on 'all' tab and has selected item, go to 'working' tab
            if (selectedItem) {
                setActiveTab('working');
            }
        } else if (activeTab === 'working') {
            // Check if all working items are finished
            if (areAllWorkingItemsFinished()) {
                // If all working items are finished, return to 'all' tab
                setActiveTab('all');
            } else {
                // If not all finished, execute next workflow step
                handleNextWorkflow();
            }
        }
    };

    const enrichedSelectedItem = selectedItem ? {
        ...selectedItem,
        heatNumber: heatNumbers[selectedItem.id] || selectedItem.heatNumber
    } : null;

    const canEditHeatNumber = selectedItem && (
        rowStateAccessor(selectedItem) === 'working' ||
        rowStateAccessor(selectedItem) === 'finished'
    );

    const showError = Boolean(errorMsg);
    const cards = cutCardConfigs(enrichedSelectedItem, {
        onHeatNumberClick: canEditHeatNumber ? handleHeatNumberEdit : undefined
    });

    const controlButtons = cutButtonConfig({
        onIsometricClick: () => {
        },
        onNoteClick: () => {
        },
        onReportClick: () => {
        },
        onNextClick: handleNextClick
    });

    const modalData = cutCompletionModalConfig(completedItem, heatNumbers);

    return (
        <>
            <NavBar title="Cutting" fixed={true}/>
            <div
                className="d-flex justify-content-center align-items-center"
                style={{height: 'calc(100vh - 56px)'}}
            >
                <Container fluid className="mx-4">
                    <Row className="g-4">
                        <Col md={5} className="d-flex flex-column gap-3">
                            <WorkPanel cards={cards}/>
                            <ControlPanel search={search} setSearch={setSearch} buttons={controlButtons} tag="PIPL"/>
                        </Col>
                        <Col md={7} className="d-flex flex-column gap-3">
                            <WorkTabs
                                tabs={tabsAllWorking}
                                activeTab={activeTab}
                                setActiveTab={(tab: string) => setActiveTab(tab as 'all' | 'working')}
                            />
                            <WorkTable
                                items={tableItems}
                                handleRowClick={handleRowClick}
                                columns={columnsPipeLength}
                                rowStates={rowStates}
                                rowStateAccessor={rowStateAccessor}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>

            <InputModal
                show={inputShow}
                onHide={handleInputHide}
                onConfirm={handleInputConfirm}
                title="Heat Number"
                inputType="number"
                isLoading={isSubmitting}
                confirmText={isEditing ? 'Update' : 'Confirm'}
                value={inputValue}
                onValueChange={setInputValue}
            />

            <ComponentLabelModal
                show={showCompletionModal}
                onHide={handleCompletionModalHide}
                onConfirm={handleCompletionModalConfirm}
                title="PIPE LENGTH"
                value={modalData.value}
                values={modalData.values}
            />

            <ErrorToast show={showError} message={errorMsg || ''} onClose={() => setErrorMsg(null)}/>
        </>
    );
}