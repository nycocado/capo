import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { WorkStatusTypeEntity } from '@database/entities';
import { UserEntity } from '@modules/user/entities';
import { WeldEntity } from '@modules/weld/entities';

@Entity({ tableName: 'weld_work_status' })
@Index({ properties: ['weld', 'workStatusType', 'createdAt'] })
export class WeldWorkStatusEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => WeldEntity, { cascade: [Cascade.ALL] })
  @Index()
  weld!: WeldEntity;

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

  @ManyToOne(() => UserEntity, { nullable: true, deleteRule: 'set null' })
  @Index()
  createdBy?: UserEntity;

  constructor(
    weld: WeldEntity,
    workStatusType: WorkStatusTypeEntity,
    notes?: string,
    createdBy?: UserEntity,
  ) {
    this.weld = weld;
    this.workStatusType = workStatusType;
    this.createdBy = createdBy;
    this.notes = notes;
  }
}
