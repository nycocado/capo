import { ApiProperty } from '@nestjs/swagger';

export class ValidateResponseDto {
  @ApiProperty({
    description: 'JWT token (development only)',
    required: false,
  })
  token?: string;

  @ApiProperty({
    description: 'Indicates if token is valid',
  })
  valid: boolean;
}
