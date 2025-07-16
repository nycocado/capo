import {
  Cascade,
  Collection,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";
import { RevEntity } from "@database/entities";
import { JointEntity } from "@modules/joint/entities";

@Entity({ tableName: "spool" })
export class SpoolEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @ManyToMany({
    entity: () => RevEntity,
    mappedBy: (r) => r.spools,
    cascade: [Cascade.ALL],
  })
  revisions = new Collection<RevEntity>(this);

  @OneToMany(() => JointEntity, (joint) => joint.spool)
  joints = new Collection<JointEntity>(this);
}
