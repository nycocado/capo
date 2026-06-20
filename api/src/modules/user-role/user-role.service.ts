import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { UserRoleEntity } from "@modules/user-role/entities";
import { UserRoleRepository } from "@modules/user-role/user-role.repository";

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: UserRoleRepository,
  ) {}

  async hasRole(userId: number, role: string): Promise<boolean> {
    return !!(await this.userRoleRepository.findByUserIdAndRoleName(
      userId,
      role,
    ));
  }
}
