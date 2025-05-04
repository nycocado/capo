"use client";
import {Col, Container, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import {pipeLengths} from "@data/mock/workTable/cutMock";
import {columnsPipeLength, WorkTable} from "@components/features/factory/WorkTable";
import {ControlPanel} from "@components/features/factory/ControlPanel";
import {WorkPanel} from "@components/features/factory/WorkPanel";
import {tabsAllWorking, WorkTabs} from "@components/features/factory/WorkTabs";
import {WorkLabel} from "@components/ui/WorkLabel";

function CuttingPage() {
    useEffect(() => {
        document.title = 'CAPO - CUT';
    }, []);

    const [items] = useState(pipeLengths);
    const [selectedItem, setSelectedItem] = useState(items[0]);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');

    const filteredItems = items.filter(it =>
        it.id.toString().includes(search)
    );
    const allItems = filteredItems;
    const workingItems = filteredItems.filter(it => it.working);

    const handleRowClick = (item: typeof items[0]) => setSelectedItem(item);

    return (
        <Container fluid className="mx-4">
            <Row className="g-3">
                <Col md={5} className="d-flex flex-column gap-3">
                    <WorkPanel selectedItem={selectedItem}/>
                    <ControlPanel search={search} setSearch={setSearch}/>
                </Col>
                <Col md={7} className="d-flex flex-column gap-3">
                    <Row className="g-3 flex-grow-1">
                        <Col md={11} className="d-flex flex-column gap-3">
                            <WorkTabs tabs={tabsAllWorking} activeTab={activeTab} setActiveTab={setActiveTab}/>
                            <WorkTable activeTab={activeTab} workingItems={workingItems} allItems={allItems}
                                       handleRowClick={handleRowClick} columns={columnsPipeLength}/>
                        </Col>
                        <Col md={1} className="d-flex flex-column gap-3">
                            <WorkLabel>
                                <h3 className="m-0 rotate-90">CUT</h3>
                            </WorkLabel>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
}

export default CuttingPage;
