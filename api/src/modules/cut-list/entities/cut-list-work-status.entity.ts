import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { WorkStatusTypeEntity } from "@database/entities/work-status-type.entity";
import { UserEntity } from "@modules/user/entities";
import { CutListEntity } from "@modules/cut-list/entities";

@Entity({ tableName: "cut_list_work_status" })
@Index({ properties: ["cutList", "workStatusType", "createdAt"] })
export class CutListWorkStatusEntity {
  @PrimaryKey({ hidden: true })
  id!: number;

  @ManyToOne(() => CutListEntity, { cascade: [Cascade.ALL], hidden: true })
  @Index()
  cutList!: CutListEntity;

  @ManyToOne(() => WorkStatusTypeEntity)
  @Index()
  workStatusType!: WorkStatusTypeEntity;

  @Property({ type: "text", nullable: true })
  notes?: string;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    hidden: true,
  })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
    hidden: true,
  })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    deleteRule: "set null",
  })
  @Index()
  createdBy?: UserEntity;

  constructor(
    cutList: CutListEntity,
    workStatusType: WorkStatusTypeEntity,
    notes?: string,
    createdBy?: UserEntity,
  ) {
    this.cutList = cutList;
    this.workStatusType = workStatusType;
    this.notes = notes;
    this.createdBy = createdBy;
  }
}
