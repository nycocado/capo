export interface DoubleValueConfig {
    type: 'double';
    label: string;
    primaryValue: string | number;
    primaryTag: string;
    secondaryValue: string | number;
    secondaryTag: string;
    onClick?: () => void;
}
export interface DoubleValueProps {
    label: string;
    primaryValue?: string | number | null;
    primaryTag: string | null;
    secondaryValue?: string | number | null;
    secondaryTag: string | null;
}