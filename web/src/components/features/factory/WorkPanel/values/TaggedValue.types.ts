export interface TaggedValueConfig {
    type: 'tagged';
    label: string;
    value: string | number;
    tag: string;
    onClick?: () => void;
}

export interface TaggedValueProps {
    label: string;
    value?: string | number | null;
    tag: string | null;
}
