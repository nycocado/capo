import {Button, Form, Alert} from "react-bootstrap";
import React from "react";
import {BaseModal} from "./BaseModal";
import {FormField, FormModalProps} from "./FormModal.types";

export function FormModal(props: FormModalProps) {
    const {
        showModal,
        title,
        fields,
        values,
        loading = false,
        error,
        submitText = "Submit",
        cancelText = "Cancel",
        handleFieldChange,
        handleSubmit,
        handleCancel,
        titleClassName = "fs-1 fw-bold text-center",
        confirmVariant = "primary",
        cancelVariant = "secondary"
    } = props;

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmit();
    };

    const renderField = (field: FormField) => {
        const value = values[field.id] || '';

        switch (field.type) {
            case 'select':
                return (
                    <Form.Select
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="form-select-lg bg-secondary text-light border-0"
                        required={field.required}
                        disabled={loading}
                    >
                        <option value="">
                            {field.placeholder || `Select ${field.label}...`}
                        </option>
                        {field.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </Form.Select>
                );

            case 'number':
                return (
                    <Form.Control
                        type="number"
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="form-control-lg bg-secondary text-light border-0"
                        placeholder={field.placeholder}
                        required={field.required}
                        disabled={loading}
                    />
                );

            case 'text':
            default:
                return (
                    <Form.Control
                        type="text"
                        value={value}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="form-control-lg bg-secondary text-light border-0"
                        placeholder={field.placeholder}
                        required={field.required}
                        disabled={loading}
                    />
                );
        }
    };

    // Check if form is valid
    const isFormValid = fields.every(field => {
        if (!field.required) return true;
        const value = values[field.id];
        return value && value.trim() !== '';
    });

    return (
        <BaseModal
            show={showModal}
            onHide={handleCancel}
            title={title}
            titleClassName={titleClassName}
            size="lg"
            contentClassName="bg-tertiary text-light rounded-3"
        >
            <Form onSubmit={handleFormSubmit}>
                <BaseModal.Body>
                    {error && (
                        <Alert variant="danger" dismissible className="mb-4">
                            {error}
                        </Alert>
                    )}

                    {loading && (
                        <Alert variant="info" className="mb-4">
                            <div className="d-flex align-items-center">
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                Loading options...
                            </div>
                        </Alert>
                    )}

                    {fields.map((field) => (
                        <Form.Group key={field.id} className="mb-4">
                            <Form.Label className="fs-5 fw-semibold text-light">
                                {field.label}
                                {field.required && <span className="text-danger ms-1">*</span>}
                            </Form.Label>
                            {renderField(field)}
                        </Form.Group>
                    ))}

                    {fields.length === 0 && !loading && (
                        <div className="text-center py-4">
                            <p className="text-muted">No fields available</p>
                        </div>
                    )}
                </BaseModal.Body>

                <BaseModal.Footer className="border-0 justify-content-between">
                    <Button
                        variant={cancelVariant}
                        onClick={handleCancel}
                        className="btn-lg px-4 text-white border-4"
                        disabled={loading}
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={confirmVariant}
                        type="submit"
                        className="btn-lg px-4 text-black border-4"
                        disabled={loading || !isFormValid}
                    >
                        {loading ? (
                            <>
                                <div className="spinner-border spinner-border-sm me-2" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                {submitText}...
                            </>
                        ) : (
                            submitText
                        )}
                    </Button>
                </BaseModal.Footer>
            </Form>
        </BaseModal>
    );
}