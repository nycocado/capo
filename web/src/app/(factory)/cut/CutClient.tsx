"use client";
import {Col, Container, Row} from "react-bootstrap";
import {useState} from "react";
import {columnsPipeLength, WorkTable} from "components/features/WorkTable";
import {ControlPanel} from "@components/features/factory/ControlPanel";
import {tabsAllWorking, WorkTabs} from "@components/features/factory/WorkTabs";
import {useCuttingTable} from "./useCuttingTable";
import {PipeLength} from "@models/pipe-length.interface";
import {ErrorToast} from '@components/common/ErrorToast';
import {WorkPanel} from "@components/features/factory/WorkPanel/WorkPanel";
import {cutCardConfigs} from "@components/features/factory/WorkPanel/WorkPanel.cardConfigs";
import {CutClientProps} from "./CutClient.types";
import {cutButtonConfig} from "@components/features/factory/ControlPanel/ControlPanel.buttonConfig";
import NavBar from "@components/layout/NavBar/NavBar";
import HeatNumberModal from "@components/features/factory/HeatNumberModal/HeatNumberModal";

export default function CutClient({initialItems, fetchError}: CutClientProps) {
    const [errorMsg, setErrorMsg] = useState<string | null>(fetchError ?? null);
    const [items] = useState<PipeLength[]>(initialItems);
    const [activeTab, setActiveTab] = useState<'all' | 'working'>('all');
    const [search, setSearch] = useState<string>('');
    const [heatModalShow, setHeatModalShow] = useState(false);
    const [heatValue, setHeatValue] = useState('');
    const handleNextClick = () => setHeatModalShow(true);
    const handleModalHide = () => {
        setHeatModalShow(false);
        setHeatValue('');
    };
    const handleModalChange = (val: string) => setHeatValue(val);
    const handleModalConfirm = (val: string) => {
        setHeatValue(val);
        setHeatModalShow(false);
    };

    const {
        tableItems,
        rowStates,
        rowStateAccessor,
        selectedItem,
        handleRowClick
    } = useCuttingTable(items, activeTab, search);
    const showError = Boolean(errorMsg);
    const cards = cutCardConfigs(selectedItem, {
        onHeatNumberClick: () => {
        }
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

    return (
        <>
            <NavBar title="Cutting"/>
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
            <HeatNumberModal
                show={heatModalShow}
                onHide={handleModalHide}
                onChange={handleModalChange}
                onConfirm={handleModalConfirm}
                value={heatValue}
            />
            <ErrorToast show={showError} message={errorMsg || ''} onClose={() => setErrorMsg(null)}/>
        </>
    );
}

