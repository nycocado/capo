import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { FittingEntity } from '@modules/fitting/entities';

@Entity({ tableName: 'fitting_type' })
export class FittingTypeEntity {
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

  @OneToMany(() => FittingEntity, (fitting) => fitting.fittingType)
  fittings = new Collection<FittingEntity>(this);
}
