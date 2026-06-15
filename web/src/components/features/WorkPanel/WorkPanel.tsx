import React from "react";
import { Card, CardBody, Row, Col } from "react-bootstrap";
import { NormalValue, NormalValueConfig } from "./values/NormalValue";
import { TaggedValue, TaggedValueConfig } from "./values/TaggedValue";
import { DoubleValue, DoubleValueConfig } from "./values/DoubleValue";

export type ValueConfig =
  | NormalValueConfig
  | TaggedValueConfig
  | DoubleValueConfig;

export interface CardConfig {
  key?: string;
  className?: string;
  items: ValueConfig[];
}

export interface WorkPanelProps {
  cards?: CardConfig[];
  containerClassName?: string;
  /** Mensagem do empty-state, exibida quando não há item selecionado (sem cards). */
  emptyMessage?: string;
}

/**
 * Painel de detalhes do item selecionado na etapa. Sem seleção (cards vazio),
 * mostra um empty-state discreto em vez de cards com valores em branco.
 */
export function WorkPanel({
  cards,
  containerClassName,
  emptyMessage = "Select a row to view its details",
}: WorkPanelProps) {
  return (
    <Card
      bg="black"
      text="light"
      className={`flex-grow-1 rounded-3 border border-primary border-2 ${containerClassName || ""}`}
    >
      {!cards || cards.length === 0 ? (
        <CardBody className="d-flex align-items-center justify-content-center text-center">
          <span className="opacity-75">{emptyMessage}</span>
        </CardBody>
      ) : (
        <CardBody className="align-baseline justify-content-center text-center">
          {cards.map((card, idx) => (
            <Card
              key={card.key ?? idx}
              bg="dark"
              text="light"
              className={`${idx === 0 ? "mb-2" : idx === cards.length - 1 ? "mt-2" : "my-2"} rounded-3 border border-tertiary ${card.className || ""}`}
            >
              <Row className="py-2">
                {card.items.map((item, i) => (
                  <Col
                    key={i}
                    ms={6}
                    onClick={item.onClick}
                    style={{
                      cursor: item.onClick ? "pointer" : "default",
                    }}
                  >
                    {item.type === "normal" && (
                      <NormalValue label={item.label} value={item.value} />
                    )}
                    {item.type === "tagged" && (
                      <TaggedValue
                        label={item.label}
                        value={item.value}
                        tag={item.tag}
                      />
                    )}
                    {item.type === "double" && (
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
      )}
    </Card>
  );
}
