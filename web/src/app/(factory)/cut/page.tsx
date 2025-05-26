"use client";
import {Col, Container, Row} from "react-bootstrap";
import {useState, useEffect} from "react";
import Cookies from 'js-cookie';
import {columnsPipeLength, WorkTable} from "@components/features/factory/WorkTable";
import {ControlPanel} from "@components/features/factory/ControlPanel";
import {WorkPanel} from "@components/features/factory/WorkPanel";
import {tabsAllWorking, WorkTabs} from "@components/features/factory/WorkTabs";
import {useCuttingTable} from './useCuttingTable';
import {PipeLength} from '@models/PipeLenght';
import {API_ROUTES} from "@/routes";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;

function CuttingPage() {
    const [items, setItems] = useState<PipeLength[]>([]);
    const [selectedItem, setSelectedItem] = useState<PipeLength | null>(null);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');
    const {tableItems, rowStates, rowStateAccessor} = useCuttingTable(items, activeTab as 'all' | 'working', search);

    useEffect(() => {
        async function loadPipeLengths() {
            const token = Cookies.get('token');

            const res = await fetch(`${API_URL}${API_ROUTES.pipeLength.cut}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                })
            ;
            const data: PipeLength[] = await res.json();
            setItems(data);
            if (data.length > 0) setSelectedItem(data[0]);
        }

        loadPipeLengths();
    }, []);

    if (!selectedItem) return <div>Loading...</div>;

    const handleRowClick = (item: PipeLength) => setSelectedItem(item);

    return (
        <Container fluid className="mx-4">
            <Row className="g-4">
                <Col md={5} className="d-flex flex-column gap-3">
                    <WorkPanel selectedItem={selectedItem}/>
                    <ControlPanel search={search} setSearch={setSearch}/>
                </Col>
                <Col md={7} className="d-flex flex-column gap-3">
                    <WorkTabs tabs={tabsAllWorking} activeTab={activeTab} setActiveTab={setActiveTab}/>
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
    );
}

export default CuttingPage;
