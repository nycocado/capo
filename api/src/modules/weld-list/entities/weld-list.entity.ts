import {
  Cascade,
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { SpoolEntity } from '@database/entities';
import { WeldListWorkStatusEntity } from '@modules/weld-list/entities/weld-list-work-status.entity';

@Entity({ tableName: 'weld_list' })
export class WeldListEntity {
  @ApiProperty()
  @PrimaryKey()
  id!: number;

  @ApiProperty()
  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @ApiProperty()
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

  @OneToMany(
    () => WeldListWorkStatusEntity,
    (weldListWorkStatus) => weldListWorkStatus.weldList,
  )
  workStatuses = new Collection<WeldListWorkStatusEntity>(this);

  constructor(internalId: string, spool: SpoolEntity) {
    this.internalId = internalId;
    this.spool = spool;
  }
}
