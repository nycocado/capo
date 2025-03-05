import React from 'react';
import {Button, Card, CardBody, Col, Form, InputGroup, Row} from "react-bootstrap";
import {ControlPanelProps} from "@components/features/factory/ControlPanel/ControlPanel.types";
import {MagnifyingGlassIcon} from '@heroicons/react/16/solid';

export function ControlPanel({search, setSearch, buttons, tag}: ControlPanelProps) {
    return (
        <Card bg="dark">
            <CardBody className="pb-2">
                <InputGroup className="mb-3">
                    <InputGroup.Text>{tag}</InputGroup.Text>
                    <Form.Control
                        className="bg-light"
                        placeholder="Search..."
                        value={search}
                        inputMode="numeric"
                        pattern="\d*"
                        onChange={e => {
                            const val = e.target.value;
                            if (/^\d*$/.test(val)) setSearch(val);
                        }}
                    />
                    <InputGroup.Text>
                        <MagnifyingGlassIcon className="text-primary" style={{height: '23px'}}/>
                    </InputGroup.Text>
                </InputGroup>
                <Row className="g-3">
                    {buttons.map((btn, idx) => (
                        <Col key={idx} className="d-flex flex-column">
                            <Button
                                variant={btn.variant}
                                className={`fs-5 ${btn.className || ''}`}
                                style={{minHeight: '50px', ...btn.style}}
                                onClick={btn.onClick}
                            >
                                {btn.label}
                            </Button>
                        </Col>
                    ))}
                </Row>
            </CardBody>
        </Card>
    )
}

