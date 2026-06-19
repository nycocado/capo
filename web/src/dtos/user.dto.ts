import { RoleDto } from "./role.dto";

export interface UserDto {
  id: number;
  internalId: string;
  name: string;
  birthDate: string;
  gender: string;
  photo?: string | null;
  roles?: RoleDto[];
}
