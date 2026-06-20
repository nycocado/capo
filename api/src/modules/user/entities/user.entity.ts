import {
  Entity,
  Enum,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";
import { Collection } from "@mikro-orm/core";
import { RoleEntity } from "@database/entities";
import { UserRoleEntity } from "@modules/user-role/entities/user-role.entity";
import { UserRepository } from "@modules/user/user.repository";

export enum Gender {
  M = "M",
  F = "F",
  O = "O",
}

@Entity({ tableName: "user", repository: () => UserRepository })
export class UserEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @Property({ length: 255, hidden: true })
  password!: string;

  @Property({ length: 60 })
  name!: string;

  @Property({ type: "date" })
  birthDate!: Date;

  @Enum(() => Gender)
  gender!: Gender;

  @Property({ length: 255, nullable: true })
  photo?: string;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @ManyToMany({ entity: () => RoleEntity, pivotEntity: () => UserRoleEntity })
  roles = new Collection<RoleEntity>(this);

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
  userRoles = new Collection<UserRoleEntity>(this);
}
