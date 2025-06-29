import {
  Cascade,
  Check,
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { PartEntity, SpoolEntity } from '@database/entities';
import { WeldEntity } from '@modules/weld/entities';
import { JointWorkStatusEntity } from '@modules/joint/entities/joint-work-status.entity';

@Entity({ tableName: 'joint' })
@Check({ expression: 'part1_id != part2_id' })
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

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(() => WeldEntity, (weld) => weld.joint)
  welds = new Collection<WeldEntity>(this);

  @OneToMany(
    () => JointWorkStatusEntity,
    (jointWorkStatus) => jointWorkStatus.joint,
  )
  workStatuses = new Collection<JointWorkStatusEntity>(this);
}
