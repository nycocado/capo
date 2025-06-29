import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { UserRoleEntity } from '@modules/user-role/entities';
import { EntityRepository } from '@mikro-orm/mariadb';

@Injectable()
export class UserRoleRepository {
  constructor(
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: EntityRepository<UserRoleEntity>,
  ) {}

  async findByUserIdAndRoleName(
    userId: number,
    roleName: string,
  ): Promise<UserRoleEntity | null> {
    return this.userRoleRepository.findOne({
      user: { id: userId },
      role: { name: roleName },
    });
  }
}
