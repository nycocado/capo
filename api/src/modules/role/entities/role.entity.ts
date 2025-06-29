import {
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@modules/user/entities';
import { UserRoleEntity } from '@modules/user-role/entities';

@Entity({ tableName: 'role' })
export class RoleEntity {
  @PrimaryKey({ hidden: true })
  id!: number;

  @ApiProperty()
  @Property({ length: 60 })
  @Unique()
  name!: string;

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @ManyToMany({ entity: () => UserEntity, mappedBy: (u) => u.roles })
  users = new Collection<UserEntity>(this);

  @OneToMany(() => UserRoleEntity, (userRole) => userRole.role)
  userRoles = new Collection<UserRoleEntity>(this);
}
