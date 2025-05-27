"use client";

import NavBar from "@components/layout/NavBar/NavBar";
import {Col, Container, Row} from "react-bootstrap";

function WeldClient() {
    return (
        <>
            <NavBar title="Welding"/>
            <div
                className="d-flex justify-content-center align-items-center"
                style={{height: 'calc(100vh - 56px)'}}
            >
                <Container fluid className="mx-4">
                    <Row className="g-4">
                        <Col md={5} className="d-flex flex-column gap-3">
                        </Col>
                        <Col md={7} className="d-flex flex-column gap-3">
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}

export default WeldClient;