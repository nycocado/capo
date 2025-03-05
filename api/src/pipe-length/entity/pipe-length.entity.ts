import { MaterialEntity } from '../../entities/material.entity';
import { ApiProperty } from '@nestjs/swagger';
import { DiameterEntity } from '../../entities/diameter.entity';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class PipeLengthEntity {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  id: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  internalId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  length: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  thickness: number;

  @ApiProperty()
  @IsString()
  heatNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  material: MaterialEntity;

  @ApiProperty()
  @IsNotEmpty()
  diameter: DiameterEntity;

  @ApiProperty({
    type: Object,
    description: 'Part details including joints, spools, sheets, and isometric',
  })
  @IsNotEmpty()
  part: any;
}
