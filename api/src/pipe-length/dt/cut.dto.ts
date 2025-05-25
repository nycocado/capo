import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CutDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  pipeLengthId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  heatNumber: string;
}
