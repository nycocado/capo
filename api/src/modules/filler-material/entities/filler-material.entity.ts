import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from '@mikro-orm/core';
import { WeldEntity } from '@modules/weld/entities';

@Entity({ tableName: 'filler_material' })
export class FillerMaterialEntity {
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

  @OneToMany(() => WeldEntity, (weld) => weld.fillerMaterial)
  welds = new Collection<WeldEntity>(this);
}
