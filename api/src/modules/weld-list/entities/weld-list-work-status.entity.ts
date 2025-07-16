import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { WeldListEntity } from "@modules/weld-list/entities/weld-list.entity";
import { WorkStatusTypeEntity } from "@database/entities/work-status-type.entity";
import { UserEntity } from "@modules/user/entities";

@Entity({ tableName: "weld_list_work_status" })
@Index({ properties: ["weldList", "workStatusType", "createdAt"] })
export class WeldListWorkStatusEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => WeldListEntity, { cascade: [Cascade.ALL] })
  @Index()
  weldList!: WeldListEntity;

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
    weldList: WeldListEntity,
    workStatusType: WorkStatusTypeEntity,
    notes?: string,
    createdBy?: UserEntity,
  ) {
    this.weldList = weldList;
    this.workStatusType = workStatusType;
    this.notes = notes;
    this.createdBy = createdBy;
  }
}
