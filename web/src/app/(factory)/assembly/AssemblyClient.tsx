"use client";

import NavBar from "@components/layout/NavBar/NavBar";
import {Col, Container, Row} from "react-bootstrap";
import {useState} from "react";
import {assemblyButtonConfig} from "@components/features/factory/ControlPanel/ControlPanel.buttonConfig";
import {ControlPanel} from "@components/features/factory/ControlPanel";
import {tabsAllWorking, WorkTabs} from "@components/features/factory/WorkTabs";
import {AssemblyClientProps} from "@/app/(factory)/assembly/AssemblyClient.types";

function AssemblyClient({initialItems, fetchError}: AssemblyClientProps) {
    const [activeTab, setActiveTab] = useState<'all' | 'working'>('all');
    const [search, setSearch] = useState<string>('');
    const controlButtons = assemblyButtonConfig(
        {
            onIsometricClick: () => {
            },
            onListClick: () => {
            },
            onNoteClick: () => {
            },
            onReportClick: () => {
            },
            onNextClick: () => {
            }
        }
    )

    return (
        <>
            <NavBar title="Assembling"/>
            <div
                className="d-flex justify-content-center align-items-center"
                style={{height: 'calc(100vh - 56px)'}}
            >
                <Container fluid className="mx-4">
                    <Row className="g-4">
                        <Col md={6} className="d-flex flex-column gap-3">
                            <ControlPanel search={search} setSearch={setSearch} buttons={controlButtons} tag="ISO"/>
                        </Col>
                        <Col md={6} className="d-flex flex-column gap-3">
                            <WorkTabs
                                tabs={tabsAllWorking}
                                activeTab={activeTab}
                                setActiveTab={(tab: string) => setActiveTab(tab as 'all' | 'working')}
                            />
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}

export default AssemblyClient;