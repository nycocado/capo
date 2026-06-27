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
  hasSelection?: boolean;
  containerClassName?: string;
  emptyMessage?: string;
}

export function WorkPanel({
  cards,
  hasSelection = true,
  containerClassName,
  emptyMessage = "Select a row to view its details",
}: WorkPanelProps) {
  return (
    <Card
      text="light"
      className={`flex-grow-1 op-panel op-panel--accent ${containerClassName || ""}`}
    >
      {!cards || cards.length === 0 ? (
        <CardBody className="d-flex align-items-center justify-content-center text-center">
          <span className="opacity-75">{emptyMessage}</span>
        </CardBody>
      ) : (
        <CardBody className="d-flex flex-column justify-content-center text-center position-relative">
          <div
            style={{
              opacity: hasSelection ? 1 : 0,
              pointerEvents: hasSelection ? undefined : "none",
            }}
          >
            {cards.map((card, idx) => (
              <Card
                key={card.key ?? idx}
                bg="secondary"
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
          </div>
          {!hasSelection && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center text-center">
              <span className="opacity-75">{emptyMessage}</span>
            </div>
          )}
        </CardBody>
      )}
    </Card>
  );
}
