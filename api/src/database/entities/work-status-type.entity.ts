import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { PartWorkStatusEntity } from '@database/entities';
import { WeldWorkStatusEntity } from '@modules/weld/entities/weld-work-status.entity';
import { JointWorkStatusEntity } from '@modules/joint/entities/joint-work-status.entity';

export const WorkStatusType = {
  TO_DO: 'to-do',
  WORKING: 'working',
  FINISHED: 'finished',
};

@Entity({ tableName: 'work_status_type' })
export class WorkStatusTypeEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 60 })
  @Unique()
  name!: string;

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(
    () => PartWorkStatusEntity,
    (partWorkStatus) => partWorkStatus.workStatusType,
  )
  partWorkStatuses = new Collection<PartWorkStatusEntity>(this);

  @OneToMany(
    () => WeldWorkStatusEntity,
    (weldWorkStatus) => weldWorkStatus.workStatusType,
  )
  weldWorkStatuses = new Collection<WeldWorkStatusEntity>(this);

  @OneToMany(
    () => JointWorkStatusEntity,
    (jointWorkStatus) => jointWorkStatus.workStatusType,
  )
  jointWorkStatuses = new Collection<JointWorkStatusEntity>(this);
}
