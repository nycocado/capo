import {Modal} from "react-bootstrap";
import React from "react";
import {BaseModalProps} from "@components/layout/Modals/BaseModal.types";

export function BaseModal(props: BaseModalProps) {
    const {
        show,
        onHide,
        title,
        titleClassName = 'display-4 fw-bold text-center',
        size,
        centered = true,
        backdrop = 'static',
        keyboard = false,
        contentClassName = 'bg-tertiary text-light rounded-3 px-3',
        children
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
            <Modal.Header closeButton={false} className="border-0 justify-content-center">
                <Modal.Title className={titleClassName}>
                    {title}
                </Modal.Title>
            </Modal.Header>
            {children}
        </Modal>
    );
}

BaseModal.Body = Modal.Body;
BaseModal.Footer = Modal.Footer;