import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AdminDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  internalId: string;
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;
}
