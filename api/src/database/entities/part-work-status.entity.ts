import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { PartEntity, WorkStatusTypeEntity } from '@database/entities';
import { UserEntity } from '@modules/user/entities';

@Entity({ tableName: 'part_work_status' })
@Index({ properties: ['part', 'workStatusType', 'createdAt'] })
export class PartWorkStatusEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => PartEntity, { cascade: [Cascade.ALL] })
  @Index()
  part!: PartEntity;

  @ManyToOne(() => WorkStatusTypeEntity)
  @Index()
  workStatusType!: WorkStatusTypeEntity;

  @Property({ type: 'text', nullable: true })
  notes?: string;

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @ManyToOne(() => UserEntity, {
    nullable: true,
    deleteRule: 'set null',
  })
  @Index()
  createdBy?: UserEntity;

  constructor(
    part: PartEntity,
    workStatusType: WorkStatusTypeEntity,
    notes?: string,
    createdBy?: UserEntity,
  ) {
    this.part = part;
    this.workStatusType = workStatusType;
    this.notes = notes;
    this.createdBy = createdBy;
  }
}
