import { Expose, Type } from "class-transformer";
import { RoleResponseDto } from "@modules/role/dto";

export class UserRoleResponseDto {
  @Expose()
  @Type(() => RoleResponseDto)
  role: RoleResponseDto;

  @Expose()
  document: string;
}
