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