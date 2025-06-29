import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { UserEntity } from '@modules/user/entities';
import { RoleEntity } from '@modules/role/entities';

@Entity({ tableName: 'user_role' })
@Unique({ properties: ['user', 'role'] })
export class UserRoleEntity {
  @PrimaryKey({ hidden: true })
  id!: number;

  @ManyToOne(() => UserEntity, { cascade: [Cascade.ALL], hidden: true })
  @Index()
  user!: UserEntity;

  @ApiProperty({ type: () => RoleEntity })
  @ManyToOne(() => RoleEntity, { cascade: [Cascade.ALL] })
  @Index()
  role!: RoleEntity;

  @ApiProperty()
  @Property({ length: 255 })
  document!: string;

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;
}
