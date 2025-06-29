import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { PipeLengthEntity } from '@modules/pipe-length/entities';
import { FittingEntity } from '@modules/fitting/entities';

@Entity({ tableName: 'material' })
export class MaterialEntity {
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

  @OneToMany(() => PipeLengthEntity, (pipeLength) => pipeLength.material)
  pipeLengths = new Collection<PipeLengthEntity>(this);

  @OneToMany(() => FittingEntity, (fitting) => fitting.material)
  fittings = new Collection<FittingEntity>(this);
}
