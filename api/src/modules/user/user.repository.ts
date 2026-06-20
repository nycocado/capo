import { EntityRepository } from "@mikro-orm/mariadb";
import { UserEntity } from "@modules/user/entities/user.entity";

export class UserRepository extends EntityRepository<UserEntity> {
  private static readonly FULL_POPULATE = ["roles"] as const;

  async findByInternalIdOrFail(internalId: string): Promise<UserEntity> {
    return this.findOneOrFail({ internalId });
  }

  async findWithRolesByIdOrFail(id: number): Promise<UserEntity> {
    return this.findOneOrFail(
      { id },
      { populate: UserRepository.FULL_POPULATE },
    );
  }
}
