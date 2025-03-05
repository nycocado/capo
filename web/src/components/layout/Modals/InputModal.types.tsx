export interface InputModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: (value: string) => void;
    title: string;
    label?: string;
    placeholder?: string;
    initialValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    inputType?: 'text' | 'number';
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
}