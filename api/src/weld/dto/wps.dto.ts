import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class WpsDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  weldId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  wpsId: number;
}
