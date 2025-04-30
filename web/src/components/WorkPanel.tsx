import {Card, CardBody, Col, Row} from "react-bootstrap";
import {PipeLength} from "../types/PipeLength.ts";

function WorkPanel({selectedItem}: { selectedItem: PipeLength }) {
    return (
        <>
            <Card text="light" className="flex-grow-1 rounded-3 bg-orange-comp">
                <Card.Body>
                    <Card text="light" className="my-2 rounded-3 bg-gray-comp">
                        <Card.Body>
                            <Row>
                                <Col>
                                    <h6 className="opacity-75">Dimensão</h6>
                                    <h2>{selectedItem.dimension}<small className="ms-2 fs-5">mm</small></h2>
                                </Col>
                                <Col>
                                    <h6 className="opacity-75">Diâmetro (DN)</h6>
                                    <h2>{selectedItem.diameter}<small className="ms-2 fs-5">mm</small></h2>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card text="light" className="my-2 rounded-3 bg-gray-comp">
                        <CardBody>
                            <Row>
                                <Col>
                                    <h6 className="opacity-75">ID</h6>
                                    <h2>PL{selectedItem.id}</h2>
                                </Col>
                                <Col>
                                    <h6 className="opacity-75">Heat Number</h6>
                                    <h2>-----</h2>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                    <Card text="light" className="my-2 rounded-3 bg-gray-comp">
                        <CardBody>
                            <Row>
                                <Col>
                                    <h6 className="opacity-75">Isométrico</h6>
                                    <h2>{selectedItem.isometric}</h2>
                                </Col>
                                <Col>
                                    <h6 className="opacity-75">Folha</h6>
                                    <h2>{selectedItem.sheet}</h2>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                    <Card text="light" className="my-2 rounded-3 bg-gray-comp">
                        <CardBody>
                            <Row>
                                <Col>
                                    <h6 className="opacity-75">Espessura</h6>
                                    <h2>{selectedItem.thickness}<small className="ms-2 fs-5">mm</small></h2>
                                </Col>
                                <Col>
                                    <h6 className="opacity-75">Material</h6>
                                    <h2>{selectedItem.material}</h2>
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Card.Body>
            </Card>
        </>
    );
}

export default WorkPanel;