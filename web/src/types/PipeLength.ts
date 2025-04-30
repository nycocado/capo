export class PipeLength {
    id: number;
    dimension: number;
    diameter: number;
    isometric: string;
    sheet: number;
    section: string;
    thickness: number;
    material: string;
    working: boolean;

    constructor(
        id: number,
        dimension: number,
        diameter: number,
        isometric: string,
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
        this.sheet = sheet;
        this.section = section;
        this.thickness = thickness;
        this.material = material;
        this.working = working;
    }
}