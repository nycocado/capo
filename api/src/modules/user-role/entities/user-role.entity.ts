import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";
import { Cascade } from "@mikro-orm/core";
import { UserEntity } from "@modules/user/entities";
import { RoleEntity } from "@database/entities";

@Entity({ tableName: "user_role" })
@Unique({ properties: ["user", "role"] })
export class UserRoleEntity {
  @PrimaryKey({ hidden: true })
  id!: number;

  @ManyToOne(() => UserEntity, { cascade: [Cascade.ALL], hidden: true })
  @Index()
  user!: UserEntity;

  @ManyToOne(() => RoleEntity, { cascade: [Cascade.ALL] })
  @Index()
  role!: RoleEntity;

  @Property({ length: 255 })
  document!: string;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;
}
