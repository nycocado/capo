import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class WeldingDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  weldId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  wpsId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  fillerMaterialId: number;
}
