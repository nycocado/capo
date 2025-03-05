import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class DiameterEntity {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  nominalMm: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  nominalInch: number;
}
