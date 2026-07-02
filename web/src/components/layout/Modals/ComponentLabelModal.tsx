import { Button, Card, Col, Row } from "react-bootstrap";
import React from "react";
import { BaseModal } from "@components/layout/Modals/BaseModal";
import { TaggedValue } from "@components/features/WorkPanel/values/TaggedValue";
import { NormalValue } from "@components/features/WorkPanel/values/NormalValue";
import { DoubleValue } from "@components/features/WorkPanel/values/DoubleValue";
import { ValueConfig } from "@components/features/WorkPanel/WorkPanel";

export interface ComponentLabelModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  value: string;
  values?: ValueConfig[];
  valueCardClassName?: string;
  valueTextStyle?: React.CSSProperties;
}

export function ComponentLabelModal(props: ComponentLabelModalProps) {
  const {
    show,
    onHide,
    onConfirm,
    title,
    value,
    values,
    valueCardClassName = "op-readout rounded-3 py-3",
    valueTextStyle = { letterSpacing: "25px", textIndent: "25px" },
  } = props;

  const renderValue = (config: ValueConfig, index: number) => {
    const clickProps = config.onClick ? { onClick: config.onClick } : {};

    switch (config.type) {
      case "tagged":
        return (
          <Col key={index} {...clickProps}>
            <TaggedValue
              label={config.label}
              value={config.value}
              tag={config.tag}
            />
          </Col>
        );

      case "normal":
        return (
          <Col key={index} {...clickProps}>
            <NormalValue label={config.label} value={config.value} />
          </Col>
        );

      case "double":
        return (
          <Col key={index} {...clickProps}>
            <DoubleValue
              label={config.label}
              primaryValue={config.primaryValue}
              primaryTag={config.primaryTag}
              secondaryValue={config.secondaryValue}
              secondaryTag={config.secondaryTag}
            />
          </Col>
        );

      default:
        return null;
    }
  };

  return (
    <BaseModal show={show} onHide={onHide} title={title} size="lg">
      <BaseModal.Body className="justify-content-center">
        <Card className={valueCardClassName} text="light">
          <Card.Body className="text-center">
            <p className="m-0 display-1 fw-bold" style={valueTextStyle}>
              {value}
            </p>
          </Card.Body>
        </Card>
        {values && values.length > 0 && (
          <Card className="bg-secondary text-light rounded-3 mt-3">
            <Card.Body className="text-center d-flex align-items-center justify-content-center">
              <Row className="w-100 align-items-center">
                {values.map((config, index) => renderValue(config, index))}
              </Row>
            </Card.Body>
          </Card>
        )}
      </BaseModal.Body>

      <BaseModal.Footer className="border-0 justify-content-between">
        <Button
          variant="outline-light"
          onClick={onHide}
          className="btn-lg px-4 border-4"
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => onConfirm()}
          className="btn-lg px-4 border-4"
        >
          Confirm
        </Button>
      </BaseModal.Footer>
    </BaseModal>
  );
}
