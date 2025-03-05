import {Button, Col, Row} from "react-bootstrap";

export function WorkTabs({tabs, activeTab, setActiveTab}: {
    tabs: string[],
    activeTab: string,
    setActiveTab: (value: string) => void
}) {
    return (
        <>
            <Row className="g-3">
                {tabs.map(tab => (
                    <Col key={tab} className={tab === 'working' ? 'text-end' : ''}>
                        <Button
                            variant={activeTab === tab ? 'primary' : 'dark'}
                            className={`w-100 fw-bold fs-5 ${activeTab === tab ? 'text-black' : 'text-primary'}`}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab.toUpperCase()}
                        </Button>
                    </Col>
                ))}
            </Row>
        </>
    );
}