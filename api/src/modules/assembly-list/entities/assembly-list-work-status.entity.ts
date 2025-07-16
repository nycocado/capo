import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { WorkStatusTypeEntity } from "@database/entities/work-status-type.entity";
import { UserEntity } from "@modules/user/entities";

@Entity({ tableName: "assembly_list_work_status" })
@Index({ properties: ["assemblyList", "workStatusType", "createdAt"] })
export class AssemblyListWorkStatusEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => AssemblyListEntity, { cascade: [Cascade.ALL] })
  @Index()
  assemblyList!: AssemblyListEntity;

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
    assemblyList: AssemblyListEntity,
    workStatusType: WorkStatusTypeEntity,
    notes?: string,
    createdBy?: UserEntity,
  ) {
    this.assemblyList = assemblyList;
    this.workStatusType = workStatusType;
    this.notes = notes;
    this.createdBy = createdBy;
  }
}
