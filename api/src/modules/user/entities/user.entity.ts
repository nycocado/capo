import {
  Collection,
  Entity,
  Enum,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import { RoleEntity } from "@modules/role/entities";
import { UserRoleEntity } from "@modules/user-role/entities";
import { PartWorkStatusEntity } from "@database/entities";
import { WeldWorkStatusEntity } from "@modules/weld/entities/weld-work-status.entity";
import { JointWorkStatusEntity } from "@modules/joint/entities/joint-work-status.entity";
import { CutListWorkStatusEntity } from "@modules/cut-list/entities/cut-list-work-status.entity";
import { AssemblyListWorkStatusEntity } from "@modules/assembly-list/entities/assembly-list-work-status.entity";
import { WeldListWorkStatusEntity } from "@modules/weld-list/entities/weld-list-work-status.entity";

export enum Gender {
  M = "M",
  F = "F",
  O = "O",
}

@Entity({ tableName: "user" })
export class UserEntity {
  @ApiProperty()
  @PrimaryKey()
  id!: number;

  @ApiProperty()
  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @Property({ length: 255 })
  password!: string;

  @ApiProperty()
  @Property({ length: 60 })
  name!: string;

  @ApiProperty()
  @Property({ type: "date" })
  birthDate!: Date;

  @ApiProperty()
  @Enum(() => Gender)
  gender!: Gender;

  @ApiProperty()
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

  @ApiProperty({ type: () => UserRoleEntity, isArray: true })
  @OneToMany(() => UserRoleEntity, (userRole) => userRole.user)
  userRoles = new Collection<UserRoleEntity>(this);

  @OneToMany(
    () => PartWorkStatusEntity,
    (partWorkStatus) => partWorkStatus.createdBy,
  )
  partWorkStatuses = new Collection<PartWorkStatusEntity>(this);

  @OneToMany(
    () => WeldWorkStatusEntity,
    (weldWorkStatus) => weldWorkStatus.createdBy,
  )
  weldWorkStatuses = new Collection<WeldWorkStatusEntity>(this);

  @OneToMany(
    () => JointWorkStatusEntity,
    (jointWorkStatus) => jointWorkStatus.createdBy,
  )
  jointWorkStatuses = new Collection<JointWorkStatusEntity>(this);

  @OneToMany(
    () => CutListWorkStatusEntity,
    (cutListWorkStatus) => cutListWorkStatus.createdBy,
  )
  cutListWorkStatuses = new Collection<CutListWorkStatusEntity>(this);

  @OneToMany(
    () => AssemblyListWorkStatusEntity,
    (assemblyListWorkStatus) => assemblyListWorkStatus.createdBy,
  )
  assemblyListWorkStatuses = new Collection<AssemblyListWorkStatusEntity>(this);

  @OneToMany(
    () => WeldListWorkStatusEntity,
    (weldListWorkStatus) => weldListWorkStatus.createdBy,
  )
  weldListWorkStatuses = new Collection<WeldListWorkStatusEntity>(this);
}
