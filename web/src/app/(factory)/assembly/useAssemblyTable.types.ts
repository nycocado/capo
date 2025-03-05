import {PipeLength} from "@models/pipe-length.interface";
import {Joint} from "@models/joint.interface";

export interface AssemblyClientProps {
    initialItems: Joint[];
    initialSelectedItem?: PipeLength | null;
    fetchError?: string;
}

export type AssemblyRow = {
    id: string;
    isoId: string;
    internalId: string;
    sheetNumber: number;
    revId: number;
    spoolCount: number;
    weldCount: number;
    spools: {
        id: number;
        internalId: string;
        welds: { id: number }[];
    }[];
};

export interface IsoItem {
    id: string;
    internalId: string;
    sheets: {
        number: number;
        revId: number;
        spools: {
            id: number;
            internalId: string;
            welds: { id: number }[];
        }[];
    }[];
}

export interface SpoolData {
    id: number;
    internalId: string;
    welds: Set<number>;
}

export interface SheetSpools {
    spoolIds: Set<number>;
    revIds: number[];
}