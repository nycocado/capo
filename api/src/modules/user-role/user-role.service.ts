import { Injectable } from '@nestjs/common';
import { UserRoleRepository } from '@modules/user-role/user-role.repository';

@Injectable()
export class UserRoleService {
  constructor(private readonly userRoleRepository: UserRoleRepository) {}

  async hasRole(userId: number, role: string): Promise<boolean> {
    return !!(await this.userRoleRepository.findByUserIdAndRoleName(
      userId,
      role,
    ));
  }
}
