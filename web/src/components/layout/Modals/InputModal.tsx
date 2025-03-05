import {Button, Form, Spinner} from "react-bootstrap";
import React, {useState, useEffect} from "react";
import {BaseModal} from "./BaseModal";
import {InputModalProps} from "@components/layout/Modals/InputModal.types";

export function InputModal(props: InputModalProps) {
    const {
        show,
        onHide,
        onConfirm,
        title,
        label,
        placeholder,
        initialValue = "",
        value: externalValue,
        onValueChange,
        inputType = "text",
        confirmText = "Confirm",
        cancelText = "Cancel",
        isLoading = false,
    } = props;

    const [internalValue, setInternalValue] = useState(initialValue);

    const isControlled = externalValue !== undefined && onValueChange !== undefined;
    const currentValue = isControlled ? externalValue : internalValue;

    useEffect(() => {
        if (show && !isControlled) {
            setInternalValue(initialValue);
        }
    }, [show, initialValue, isControlled]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;

        if (inputType === 'number') {
            if (/^\d*$/.test(val)) {
                if (isControlled) {
                    onValueChange!(val);
                } else {
                    setInternalValue(val);
                }
            }
        } else {
            if (isControlled) {
                onValueChange!(val);
            } else {
                setInternalValue(val);
            }
        }
    };

    const handleConfirm = () => {
        if (isLoading) return;
        onConfirm(currentValue);
    };

    const handleClose = () => {
        if (isLoading) return;

        if (!isControlled) {
            setInternalValue(initialValue);
        }

        onHide();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (isLoading) return;

        if (e.key === 'Enter') {
            handleConfirm();
        } else if (e.key === 'Escape') {
            handleClose();
        }
    };

    const isConfirmDisabled = !currentValue.trim() || isLoading;

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
                            value={currentValue}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyPress}
                            placeholder={placeholder}
                            autoFocus
                            disabled={isLoading}
                            inputMode={inputType === 'number' ? "numeric" : "text"}
                            pattern={inputType === 'number' ? "\\d*" : undefined}
                            className="text-center"
                            style={{fontSize: '2.5rem', letterSpacing: '0.5rem', textIndent: '0.5rem'}}
                        />
                    </Form.Group>
                </Form>
            </BaseModal.Body>
            <BaseModal.Footer className="border-0 justify-content-between">
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="btn-lg px-4 text-white border-4"
                >
                    {cancelText}
                </Button>
                <Button
                    variant="primary"
                    onClick={handleConfirm}
                    disabled={isConfirmDisabled}
                    className="btn-lg px-4 text-white border-4"
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