import {
  Cascade,
  Collection,
  Entity,
  Enum,
  Index,
  OneToMany,
  OneToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { PipeLengthEntity } from "@modules/pipe-length/entities";
import { FittingEntity } from "@modules/fitting/entities";
import { JointEntity } from "@modules/joint/entities";
import { PartWorkStatusEntity } from "@database/entities";

export enum PartType {
  PIPE_LENGTH = "pipe_length",
  FITTING = "fitting",
}

@Entity({ tableName: "part" })
export class PartEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  @Enum(() => PartType)
  @Index()
  type!: PartType;

  @Property({ length: 10 })
  @Index()
  number!: string;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToOne(() => PipeLengthEntity, (pipeLength) => pipeLength.part, {
    nullable: true,
    cascade: [Cascade.ALL],
  })
  pipeLength?: PipeLengthEntity;

  @OneToOne(() => FittingEntity, (fitting) => fitting.part, {
    nullable: true,
    cascade: [Cascade.ALL],
  })
  fitting?: FittingEntity;

  @OneToMany(() => JointEntity, (joint) => joint.part1)
  jointsAsPart1 = new Collection<JointEntity>(this);

  @OneToMany(() => JointEntity, (joint) => joint.part2)
  jointsAsPart2 = new Collection<JointEntity>(this);

  @OneToMany(
    () => PartWorkStatusEntity,
    (partWorkStatus) => partWorkStatus.part,
  )
  workStatuses = new Collection<PartWorkStatusEntity>(this);
}
