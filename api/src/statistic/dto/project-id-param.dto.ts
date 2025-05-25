import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class ProjectIdParamDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  projectId: number;
}
