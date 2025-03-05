interface Material {
    id: number;
    name: string;
}

interface Part {
    id: number;
    number: string;
}

interface FittingType {
    id: number;
    name: string;
}

interface Diameter {
    id: number;
    nominalMm: string;
    nominalInch: string;
}

interface Port {
    id: number;
    number: number;
    diameter: Diameter;
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

export interface Fitting {
    id: number;
    internalId: string;
    description: string;
    length: string;
    thickness: string;
    heatNumber: string | null;
    material: Material;
    part: Part;
    fittingType: FittingType;
    ports: Port[];
    isometric: Isometric;
}