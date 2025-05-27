export interface NormalValueConfig {
    type: 'normal';
    label: string;
    value: string | number;
    onClick?: () => void;
}

export interface NormalValueProps {
    label: string;
    value?: string | number;
}