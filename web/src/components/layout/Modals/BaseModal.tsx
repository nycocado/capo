import { Modal } from "react-bootstrap";
import React from "react";

export interface BaseModalProps {
  show: boolean;
  onHide: () => void;
  title: string;
  titleClassName?: string;
  size?: "sm" | "lg" | "xl" | undefined;
  centered?: boolean;
  backdrop?: "static" | boolean;
  keyboard?: boolean;
  contentClassName?: string;
  children: React.ReactNode;
}

export function BaseModal(props: BaseModalProps) {
  const {
    show,
    onHide,
    title,
    titleClassName = "display-4 fw-bold text-center",
    size,
    centered = true,
    backdrop = "static",
    keyboard = false,
    contentClassName = "op-modal px-3",
    children,
  } = props;

  return (
    <Modal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      backdrop={backdrop}
      keyboard={keyboard}
      contentClassName={contentClassName}
    >
      <Modal.Header
        closeButton={false}
        className="border-0 justify-content-center"
      >
        <Modal.Title className={titleClassName}>{title}</Modal.Title>
      </Modal.Header>
      {children}
    </Modal>
  );
}

BaseModal.Body = Modal.Body;
BaseModal.Footer = Modal.Footer;
