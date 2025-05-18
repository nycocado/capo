export class PipeLength {
    id: number;
    dimension: number;
    diameter: number;
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
        diameter: number,
        isometric: string,
        heatNumber: string,
        sheet: number,
        section: string,
        thickness: number,
        material: string,
        working: boolean
    ) {
        this.id = id;
        this.dimension = dimension;
        this.diameter = diameter;
        this.isometric = isometric;
        this.heatNumber = heatNumber;
        this.sheet = sheet;
        this.part = section;
        this.thickness = thickness;
        this.material = material;
        this.working = working;
    }
}