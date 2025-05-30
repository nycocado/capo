import {Weld} from "@models/weld.interface";

export interface WeldClientProps {
    initialItems: Weld[];
    fetchError?: string;
}

export type WeldRow = {
    id: string; // ID único obrigatório para animações
    spoolId: number;
    spoolInternalId: string;
    isoId: string;
    isoInternalId: string;
    sheetNumber: number;
    revId: number;
    weldCount: number;
    welds: WeldItemWithSpool[];
};

export interface WeldItemWithSpool {
    id: number;
    filler?: any;
    wps?: any;
    spoolInternalId: string;
}

export interface IsoItem {
    id: string;
    internalId: string;
    sheets: {
        number: number;
        revId: number;
        spools: {
            id: number;
            internalId: string;
            welds: { id: number; filler?: any; wps?: any }[];
        }[];
    }[];
}

export interface SpoolData {
    id: number;
    internalId: string;
    welds: Map<number, { filler?: any; wps?: any }>;
}

export interface SheetSpools {
    spoolIds: Set<number>;
    revIds: number[];
}