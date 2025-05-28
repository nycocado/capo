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

interface Weld {
    id: number;
}

export interface Joint {
    id: number;
    spool: Spool;
    welds: Weld[];
}

