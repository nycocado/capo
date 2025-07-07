import { PipeLengthDto } from './pipe-length.dto';
import { FittingDto } from './fitting.dto';
import { SpoolDto } from './spool.dto';

export interface SheetDto {
  id: number;
  number: number;
  document?: string;
  pipeLengths?: PipeLengthDto[];
  fittings?: FittingDto[];
  spools?: SpoolDto[];
}
