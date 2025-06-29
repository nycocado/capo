import { Expose, Type } from 'class-transformer';
import { UserRoleResponseDto } from '@modules/user-role/dto';

export class UserResponseDto {
  @Expose()
  id: number;

  @Expose()
  internalId: string;

  @Expose()
  name: string;

  @Expose()
  birthDate: Date;

  @Expose()
  gender: string;

  @Expose()
  photo?: string;

  @Expose()
  @Type(() => UserRoleResponseDto)
  userRoles?: UserRoleResponseDto[];
}
