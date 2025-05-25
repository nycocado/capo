import {Dn} from "@models/Dn";

export class PipeLength {
    id: number;
    dimension: number;
    dn: Dn;
    isometric: string;
    heatNumber?: string;
    sheet: number;
    part: string;
    thickness: number;
    material: string;
    working: boolean;

    constructor(
        id: number,
        dimension: number,
        dn: Dn,
        isometric: string,
        heatNumber: string | undefined,
        sheet: number,
        section: string,
        thickness: number,
        material: string,
        working: boolean
    ) {
        this.id = id;
        this.dimension = dimension;
        this.dn = dn;
        this.isometric = isometric;
        this.heatNumber = heatNumber;
        this.sheet = sheet;
        this.part = section;
        this.thickness = thickness;
        this.material = material;
        this.working = working;
    }

    get diameterMm(): number {
        return this.dn.mm;
    }

    get diameterInch(): number {
        return this.dn.inch;
    }
}
