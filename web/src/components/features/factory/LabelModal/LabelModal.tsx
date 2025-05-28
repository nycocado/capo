import { Button, Card, Col, Form, Modal, Row } from "react-bootstrap";
import { NormalValue, TaggedValue } from "../WorkPanel";

function LabelModal({
  show,
  onHide,
  onConfirm,
  title,
  comp,
}: {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  comp: string;
}) {
  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      keyboard={false}
      contentClassName="bg-tertiary text-light rounded-3 px-3"
    >
      <Modal.Header
        closeButton={false}
        className="border-0 justify-content-center"
      >
        <Modal.Title className="display-3 fw-bold text-center">
          {title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="justify-content-center">
        <Card className="bg-surfice  text-light rounded-3 py-3" text="dark">
          <Card.Body className="text-center">
            <p
              className="m-0 display-1 fw-bold"
              style={{ letterSpacing: "25px" }}
            >
              {comp}
            </p>
          </Card.Body>
        </Card>
        {/* Merda */}
        <Card className="bg-secondary text-light rounded-3 mt-3">
          <Card.Body className="text-center">
            <Row>
              <Col>
                <TaggedValue
                  label={"Dimension"}
                  value={"value"}
                  tag={"tag"}
                ></TaggedValue>
              </Col>
              <Col>
                <NormalValue
                  label={"Isometric"}
                  value={"Value 1"}
                ></NormalValue>
              </Col>
              <Col>
                <NormalValue
                  label={"Heat Number"}
                  value={"value 2"}
                ></NormalValue>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Modal.Body>

      <Modal.Footer className="border-0 justify-content-between">
        <Button
          variant="danger"
          onClick={onHide}
          className="btn-lg px-4 text-white border-4"
        >
          Cancel
        </Button>
        <Button
          variant="success"
          onClick={() => onConfirm()}
          className="btn-lg px-4 text-white border-4"
        >
          Confirm
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LabelModal;
