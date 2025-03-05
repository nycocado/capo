export interface UseFormModalProps {
    processWeld: (weldId: number, wpsId: number, fillerId: number) => Promise<boolean>;
    editWps: (weldId: number, wpsId: number) => Promise<boolean>;
    editFillerMaterial: (weldId: number, fillerId: number) => Promise<boolean>;
    onError?: (error: string) => void;
}
