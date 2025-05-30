export interface DropdownOption {
    label: string;
    value: string;
}

export interface FormField {
    id: string;
    label: string;
    type: 'select' | 'text' | 'number';
    required?: boolean;
    options?: DropdownOption[];
    placeholder?: string;
}

export interface FormModalData {
    [key: string]: string;
}

export interface FormModalProps {
    showModal: boolean;
    title: string;
    fields: FormField[];
    values: Record<string, string>;
    loading?: boolean;
    error?: string | null;
    submitText?: string;
    cancelText?: string;

    // Handlers
    handleFieldChange: (fieldId: string, value: string) => void;
    handleSubmit: () => void;
    handleCancel: () => void;

    // Style props
    titleClassName?: string;
    confirmVariant?: string;
    cancelVariant?: string;
}