import {Button, Card, CardBody, Col, Form, InputGroup, Row} from "react-bootstrap";

export function ControlPanel({search, setSearch}: { search: string, setSearch: (value: string) => void }) {
    return (
        <Card bg="dark">
            <CardBody>
                <InputGroup className="mb-3">
                    <Form.Control
                        placeholder="Search..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    <Button variant="outline-light">
                        <i className="bi bi-search"></i>
                    </Button>
                </InputGroup>
                <Row className="g-3">
                    <Col>
                        <Button variant="outline-warning" className="w-100">Isometric</Button>
                    </Col>
                    <Col>
                        <Button variant="outline-secondary" className="w-100">Note</Button>
                    </Col>
                    <Col>
                        <Button variant="outline-danger" className="w-100">Report</Button>
                    </Col>
                    <Col>
                        <Button variant="outline-success" className="w-100">Next</Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    )
}