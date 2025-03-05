import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class AssemblyDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  jointId: number;
}
