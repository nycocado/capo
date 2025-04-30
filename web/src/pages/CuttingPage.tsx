import '../styles/global.css';
import {Col, Container, Row} from "react-bootstrap";
import {useEffect, useState} from "react";
import WorkPanel from "../components/WorkPanel.tsx";
import {PipeLength} from "../types/PipeLength.ts";
import ControlPanel from "../components/ControlPanel.tsx";
import WorkTable from "../components/WorkTable.tsx";

const dummyItems: PipeLength[] = [
    {
        id: 1078,
        dimension: 1979,
        diameter: 65,
        isometric: 'ERB-SM018',
        sheet: 1,
        section: '1.1',
        thickness: 5,
        material: '306L',
        working: true
    },
    {
        id: 1079,
        dimension: 334,
        diameter: 65,
        isometric: 'ERB-SM018',
        sheet: 1,
        section: '1.2',
        thickness: 5,
        material: '306L',
        working: false
    },
    {
        id: 1080,
        dimension: 897,
        diameter: 65,
        isometric: 'ERB-SM018',
        sheet: 1,
        section: '1.3',
        thickness: 5,
        material: '306L',
        working: false
    }
];

function CuttingPage() {
    useEffect(() => {
        document.title = 'CAPO - CORTE'
    }, []);

    const [items] = useState(dummyItems);
    const [selectedItem, setSelectedItem] = useState(items[0]);
    const [activeTab, setActiveTab] = useState('all');
    const [search, setSearch] = useState('');

    const filteredItems = items.filter(it =>
        it.id.toString().includes(search)
    );
    const allItems = filteredItems;
    const workingItems = filteredItems.filter(it => it.working);

    const handleRowClick = (item: typeof dummyItems[0]) => setSelectedItem(item);

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'auto',
            backgroundColor: '#000000'
        }}>
            <Container fluid className="mx-4">
                <Row className="g-3">
                    <Col md={5} className="d-flex flex-column gap-3">
                        <WorkPanel selectedItem={selectedItem}/>
                        <ControlPanel search={search} setSearch={setSearch}/>
                    </Col>
                    <Col md={7}>
                        <WorkTable activeTab={activeTab} setActiveTab={setActiveTab} workingItems={workingItems} allItems={allItems} handleRowClick={handleRowClick}/>
                    </Col>
                </Row>
            </Container>
        </div>
    );
}

export default CuttingPage;
