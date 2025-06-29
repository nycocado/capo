import {
  Cascade,
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from '@mikro-orm/core';
import { JointEntity } from '@modules/joint/entities';
import { FillerMaterialEntity } from '@modules/filler-material/entities';
import { WpsEntity } from '@modules/wps/entities';
import { WeldWorkStatusEntity } from '@modules/weld/entities/weld-work-status.entity';

@Entity({ tableName: 'weld' })
export class WeldEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 10 })
  number: string;

  @ManyToOne(() => JointEntity, { cascade: [Cascade.ALL] })
  @Index()
  joint!: JointEntity;

  @ManyToOne(() => FillerMaterialEntity, {
    nullable: true,
    deleteRule: 'set null',
  })
  @Index()
  fillerMaterial?: FillerMaterialEntity;

  @ManyToOne(() => WpsEntity, { nullable: true, deleteRule: 'set null' })
  @Index()
  wps?: WpsEntity;

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(
    () => WeldWorkStatusEntity,
    (weldWorkStatus) => weldWorkStatus.weld,
  )
  workStatuses = new Collection<WeldWorkStatusEntity>(this);
}
