import { Button } from "react-bootstrap";
import React from "react";
import { BaseModal } from "./BaseModal";

export interface ConfirmModalProps {
  show: boolean;
  onHide: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmVariant?: string;
  cancelVariant?: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal(props: ConfirmModalProps) {
  const {
    show,
    onHide,
    onConfirm,
    title,
    body,
    confirmVariant = "primary",
    cancelVariant = "secondary",
    confirmText = "Confirm",
    cancelText = "Cancel",
  } = props;

  return (
    <BaseModal
      show={show}
      onHide={onHide}
      title={title}
      titleClassName="fs-1 fw-bold text-center"
    >
      <BaseModal.Body className="fs-5 text-center">{body}</BaseModal.Body>

      <BaseModal.Footer className="border-0 justify-content-between">
        <Button
          variant={cancelVariant}
          onClick={onHide}
          className="btn-lg px-4 text-white border-4"
        >
          {cancelText}
        </Button>
        <Button
          variant={confirmVariant}
          onClick={onConfirm}
          className="btn-lg px-4 text-black border-4"
        >
          {confirmText}
        </Button>
      </BaseModal.Footer>
    </BaseModal>
  );
}
