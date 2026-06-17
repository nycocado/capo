import {
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";
import { Cascade, Collection } from "@mikro-orm/core";
import { IsometricEntity } from "@database/entities";
import { JointEntity } from "@modules/joint/entities";

@Entity({ tableName: "spool" })
export class SpoolEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @ManyToOne(() => IsometricEntity, { cascade: [Cascade.ALL] })
  @Index()
  isometric!: IsometricEntity;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(() => JointEntity, (joint) => joint.spool)
  joints = new Collection<JointEntity>(this);
}
