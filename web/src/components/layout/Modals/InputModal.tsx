import { Button, Form, Spinner } from "react-bootstrap";
import React from "react";
import { BaseModal } from "./BaseModal";

export interface InputModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label?: string;
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  inputType?: "text" | "number";
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function InputModal(props: InputModalProps) {
  const {
    show,
    onHide,
    onConfirm,
    title,
    label,
    placeholder,
    value,
    onValueChange,
    inputType = "text",
    confirmText = "Confirm",
    cancelText = "Cancel",
    isLoading = false,
  } = props;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (inputType === "number" && !/^\d*$/.test(val)) return;
    onValueChange(val);
  };

  const handleConfirm = () => {
    if (isLoading) return;
    onConfirm(value);
  };

  const handleClose = () => {
    if (isLoading) return;
    onHide();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (isLoading) return;

    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      handleClose();
    }
  };

  const isConfirmDisabled = !value.trim() || isLoading;

  return (
    <BaseModal
      show={show}
      onHide={handleClose}
      title={title}
      backdrop={isLoading ? "static" : true}
      keyboard={!isLoading}
    >
      <BaseModal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">{label}</Form.Label>
            <Form.Control
              type="text"
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              autoFocus
              disabled={isLoading}
              inputMode={inputType === "number" ? "numeric" : "text"}
              pattern={inputType === "number" ? "\\d*" : undefined}
              className="text-center"
              style={{
                fontSize: "2.5rem",
                letterSpacing: "0.5rem",
                textIndent: "0.5rem",
              }}
            />
          </Form.Group>
        </Form>
      </BaseModal.Body>
      <BaseModal.Footer className="border-0 justify-content-between">
        <Button
          variant="outline-light"
          onClick={handleClose}
          disabled={isLoading}
          className="btn-lg px-4 border-4"
        >
          {cancelText}
        </Button>
        <Button
          variant="primary"
          onClick={handleConfirm}
          disabled={isConfirmDisabled}
          className="btn-lg px-4 border-4"
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
            </>
          ) : (
            confirmText
          )}
        </Button>
      </BaseModal.Footer>
    </BaseModal>
  );
}
