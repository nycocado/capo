import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { WorkStatusTypeEntity } from "@database/entities";
import { UserEntity } from "@modules/user/entities";
import { JointEntity } from "@modules/joint/entities";

@Entity({ tableName: "joint_work_status" })
@Index({ properties: ["joint", "workStatusType", "createdAt"] })
export class JointWorkStatusEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => JointEntity, { cascade: [Cascade.ALL] })
  @Index()
  joint!: JointEntity;

  @ManyToOne(() => WorkStatusTypeEntity)
  @Index()
  workStatusType!: WorkStatusTypeEntity;

  @Property({ type: "text", nullable: true })
  notes?: string;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, { nullable: true, deleteRule: "set null" })
  @Index()
  createdBy?: UserEntity;

  constructor(
    joint: JointEntity,
    workStatusType: WorkStatusTypeEntity,
    notes?: string,
    createdBy?: UserEntity,
  ) {
    this.joint = joint;
    this.workStatusType = workStatusType;
    this.notes = notes;
    this.createdBy = createdBy;
  }
}
