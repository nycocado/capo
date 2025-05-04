import {Card, CardBody, Col, Row} from "react-bootstrap";
import {PipeLength} from "@models/PipeLenght"

export function WorkPanel({selectedItem}: { selectedItem: PipeLength }) {
    return (
        <Card bg="primary" text="light" className="flex-grow-1 rounded-3">
            <Card.Body className="align-baseline justify-content-center text-center">
                <Card bg="dark" text="light" className="my-2 rounded-3">
                    <Card.Body>
                        <Row>
                            <Col>
                                <h6 className="opacity-75">Dimension</h6>
                                <h1>{selectedItem.dimension}<small className="ms-2 fs-5">mm</small></h1>
                            </Col>
                            <Col>
                                <h6 className="opacity-75">Diameter (DN)</h6>
                                <h1>{selectedItem.diameter}<small className="ms-2 fs-5">mm</small></h1>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
                <Card bg="dark" text="light" className="my-2 rounded-3">
                    <CardBody>
                        <Row>
                            <Col>
                                <h6 className="opacity-75">ID</h6>
                                <h1>PL{selectedItem.id}</h1>
                            </Col>
                            <Col>
                                <h6 className="opacity-75">Heat Number</h6>
                                <h1>-----</h1>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Card bg="dark" text="light" className="my-2 rounded-3">
                    <CardBody>
                        <Row>
                            <Col>
                                <h6 className="opacity-75">Isometric</h6>
                                <h1>{selectedItem.isometric}</h1>
                            </Col>
                            <Col>
                                <h6 className="opacity-75">Sheet</h6>
                                <h1>{selectedItem.sheet}</h1>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
                <Card bg="dark" text="light" className="my-2 rounded-3">
                    <CardBody>
                        <Row>
                            <Col>
                                <h6 className="opacity-75">Thickness</h6>
                                <h1>{selectedItem.thickness}<small className="ms-2 fs-5">mm</small></h1>
                            </Col>
                            <Col>
                                <h6 className="opacity-75">Material</h6>
                                <h1>{selectedItem.material}</h1>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </Card.Body>
        </Card>
    );
}