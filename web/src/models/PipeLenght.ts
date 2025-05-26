// Models for PipeLength and related types
export interface Material {
  id: number;
  name: string;
}

export interface Diameter {
  id: number;
  nominalMm: string;
  nominalInch: string;
}

export interface Sheet {
  id: number;
  number: number;
}

export interface Isometric {
  id: number;
  internalId: string;
  sheet: Sheet[];
}

export interface Part {
  id: number;
  number: string;
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
