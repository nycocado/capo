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
                       <Button variant="outline-complement" className="h-100 fs-6" style={{ minHeight: '50px' }}>Isometric</Button>
                   </Col>
                   <Col className="d-flex flex-column">
                       <Button variant="outline-note" className="h-100 fs-6" style={{ minHeight: '50px' }}>Note</Button>
                   </Col>
                   <Col className="d-flex flex-column">
                       <Button variant="outline-danger" className="h-100 fs-6" style={{ minHeight: '50px' }}>Report</Button>
                   </Col>
                   <Col className="d-flex flex-column">
                       <Button variant="outline-success" className="h-100 fs-6" style={{ minHeight: '50px' }}>Next</Button>
                   </Col>
               </Row>
            </CardBody>
        </Card>
    )
}