import { EntityRepository } from "@mikro-orm/mariadb";
import { UserRoleEntity } from "@modules/user-role/entities";

/** Acesso a dados dos user_roles (registrado na entidade via `repository`). */
export class UserRoleRepository extends EntityRepository<UserRoleEntity> {
  async findByUserIdAndRoleName(
    userId: number,
    roleName: string,
  ): Promise<UserRoleEntity | null> {
    return this.findOne({ user: { id: userId }, role: { name: roleName } });
  }
}
