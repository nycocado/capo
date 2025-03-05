interface Material {
    id: number;
    name: string;
}

interface Diameter {
    id: number;
    nominalMm: string;
    nominalInch: string;
}

interface Part {
    id: number;
    number: string;
}

interface Sheet {
    id: number;
    number: number;
}

interface Isometric {
    id: number;
    internalId: string;
    sheet: Sheet[];
}

export interface PipeLength {
    id: number;
    internalId: string;
    length: string;
    thickness: string;
    heatNumber?: string | null;
    material: Material;
    diameter: Diameter;
    part: Part;
    isometric: Isometric;
}
