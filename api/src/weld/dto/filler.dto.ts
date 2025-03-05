import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class FillerDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  weldId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  fillerMaterialId: number;
}
