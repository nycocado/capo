import {Button, Card, CardBody, Col, Form, InputGroup, Row} from "react-bootstrap";

export function ControlPanel({search, setSearch}: { search: string, setSearch: (value: string) => void }) {
    return (
        <Card bg="dark">
            <CardBody>
                <InputGroup className="mb-4">
                    <Form.Control
                        placeholder="Search..."
                        value={search}
                        type="text"
                        onChange={e => setSearch(e.target.value)}
                    />
                    <Button variant="outline-light">
                        <i className="bi bi-search"></i>
                    </Button>
                </InputGroup>
               <Row className="g-3">
                   <Col className="d-flex flex-column">
                       <Button variant="warning" className="h-100 fs-5" style={{ minHeight: '60px' }}>Isometric</Button>
                   </Col>
                   <Col className="d-flex flex-column">
                       <Button variant="secondary" className="h-100 fs-5" style={{ minHeight: '60px' }}>Note</Button>
                   </Col>
                   <Col className="d-flex flex-column">
                       <Button variant="danger" className="h-100 fs-5" style={{ minHeight: '60px' }}>Report</Button>
                   </Col>
                   <Col className="d-flex flex-column">
                       <Button variant="success" className="h-100 fs-5" style={{ minHeight: '60px' }}>Next</Button>
                   </Col>
               </Row>
            </CardBody>
        </Card>
    )
}