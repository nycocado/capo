import React from 'react';
import {Card, CardBody, Row, Col} from 'react-bootstrap';
import {NormalValue} from './values/NormalValue';
import {TaggedValue} from './values/TaggedValue';
import {DoubleValue} from './values/DoubleValue';
import {WorkPanelProps} from './WorkPanel.types';

export function WorkPanel({cards, containerClassName}: WorkPanelProps) {
    return (
        <Card bg="primary" text="light" className={`flex-grow-1 rounded-3 ${containerClassName || ''}`}>
            <CardBody className="align-baseline justify-content-center text-center">
                {cards.map((card, idx) => (
                    <Card key={card.key ?? idx} bg="dark" text="light"
                          className={`${idx === 0 ? 'mb-2' : idx === cards.length - 1 ? 'mt-2' : 'my-2'} rounded-3 ${card.className || ''}`}>
                        <Row className="py-2">
                            {card.items.map((item, i) => (
                                <Col
                                    key={i}
                                    ms={6}
                                    onClick={item.onClick}
                                    style={{cursor: item.onClick ? 'pointer' : 'default'}}
                                >
                                    {item.type === 'normal' && <NormalValue label={item.label} value={item.value}/>}
                                    {item.type === 'tagged' &&
                                        <TaggedValue label={item.label} value={item.value} tag={item.tag}/>}
                                    {item.type === 'double' && (
                                        <DoubleValue
                                            label={item.label}
                                            primaryValue={item.primaryValue}
                                            primaryTag={item.primaryTag}
                                            secondaryValue={item.secondaryValue}
                                            secondaryTag={item.secondaryTag}
                                        />
                                    )}
                                </Col>
                            ))}
                        </Row>
                    </Card>
                ))}
            </CardBody>
        </Card>
    );
}

