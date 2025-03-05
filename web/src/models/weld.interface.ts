interface Isometric {
    id: number;
    internalId: string;
}

interface Sheet {
    id: number;
    number: number;
    isometric: Isometric;
}

interface Rev {
    id: number;
    sheet: Sheet;
}

interface Spool {
    id: number;
    internalId: string;
    revs: Rev[];
}

interface Joint {
    id: number;
    spoolId: number;
    spool: Spool;
}

interface Filler {
    id?: number;
    name?: string;
}

interface WPS {
    id: number;
    name: string;
    document: string;
    tpi: number;
}

export interface Weld {
    id: number;
    joint: Joint;
    filler: Filler | null;
    wps: WPS | null;
}