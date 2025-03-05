import React from 'react';
import {Toast, ToastContainer} from 'react-bootstrap';

interface ErrorToastProps {
    show: boolean;
    message: string;
    onClose: () => void;
}

export function ErrorToast({show, message, onClose}: ErrorToastProps) {
    return (
        <ToastContainer position="bottom-center" className="p-3">
            <Toast bg="danger" show={show} onClose={onClose} delay={5000} autohide>
                <Toast.Header closeButton={true} className="bg-danger text-white">
                    <strong className="me-auto text-white">Error</strong>
                </Toast.Header>
                <Toast.Body className="text-white">{message}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
}

