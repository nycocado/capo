import { ApiProperty } from '@nestjs/swagger';

export class HasRoleResponseDto {
  @ApiProperty({
    description: 'Indicates if the user has the required role',
    example: true,
  })
  hasRole: boolean;
}
