import {
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";
import { Collection } from "@mikro-orm/core";
import { UserEntity } from "@modules/user/entities/user.entity";
import { UserRoleEntity } from "@modules/user-role/entities/user-role.entity";

@Entity({ tableName: "role" })
export class RoleEntity {
  @PrimaryKey({ hidden: true })
  id!: number;

  @Property({ length: 60 })
  @Unique()
  name!: string;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @ManyToMany({ entity: () => UserEntity, mappedBy: (u) => u.roles })
  users = new Collection<UserEntity>(this);

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.role)
  userRoles = new Collection<UserRoleEntity>(this);
}
