import {
  Check,
  Entity,
  Enum,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { Cascade, Collection } from "@mikro-orm/core";
import { PartEntity, SpoolEntity } from "@database/entities";
import { WeldEntity } from "@modules/weld/entities";
import { JointStatusEventEntity } from "@modules/joint/entities";

export enum JointStatus {
  TO_DO = "to_do",
  DONE = "done",
}

@Entity({ tableName: "joint" })
@Check({ expression: "part1_id != part2_id" })
export class JointEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => PartEntity, { cascade: [Cascade.ALL] })
  @Index()
  part1!: PartEntity;

  @ManyToOne(() => PartEntity, { cascade: [Cascade.ALL] })
  @Index()
  part2!: PartEntity;

  @ManyToOne(() => SpoolEntity, { cascade: [Cascade.ALL] })
  @Index()
  spool!: SpoolEntity;

  @Enum({ items: () => JointStatus, default: JointStatus.TO_DO })
  @Index()
  status: JointStatus = JointStatus.TO_DO;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(() => WeldEntity, (weld) => weld.joint)
  welds = new Collection<WeldEntity>(this);

  @OneToMany(() => JointStatusEventEntity, (event) => event.joint)
  statusEvents = new Collection<JointStatusEventEntity>(this);
}
