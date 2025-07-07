import { FillerMaterialDto } from './filler-material.dto';
import { WpsDto } from './wps.dto';
import { WorkStatusDto } from './work-status.dto';

export interface WeldDto {
  id: number;
  number: string;
  fillerMaterial?: FillerMaterialDto;
  wps?: WpsDto;
  workStatus?: WorkStatusDto;
}
