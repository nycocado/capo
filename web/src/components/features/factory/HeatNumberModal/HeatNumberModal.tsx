import {Button, Form, Modal} from "react-bootstrap";

function HeatNumberModal({show, onHide, onConfirm, onChange, value}: {
    show: boolean;
    onHide: () => void;
    onConfirm: (value: string) => void;
    onChange: (value: string) => void;
    value: string
}) {
    return (
        <Modal
            show={show}
            onHide={onHide}
            centered
            backdrop="static"
            keyboard={false}
            contentClassName="bg-tertiary text-light rounded-3 px-3"
        >
            <Modal.Header closeButton={false} className="border-0 justify-content-center">
                <Modal.Title className="display-3 fw-bold text-center">
                    Heat Number
                </Modal.Title>
            </Modal.Header>

            <Modal.Body className="d-flex justify-content-center">
                <Form.Control
                    type="text"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Enter heat number"
                    className="text-center rounded-3"
                    style={{fontSize: '2.5rem'}}
                />
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
                    onClick={() => onConfirm(value)}
                    className="btn-lg px-4 text-white border-4"
                >
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default HeatNumberModal;