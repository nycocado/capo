import { UserRoleDto } from './user-role.dto';

export interface UserDto {
  id: number;
  internalId: string;
  name: string;
  birthDate: Date;
  gender: string;
  photo?: string;
  userRoles?: UserRoleDto[];
}
