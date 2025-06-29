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
import { ProjectEntity } from '@modules/project/entities';
import { SheetEntity } from '@database/entities';
import { CutListEntity } from '@modules/cut-list/entities';

@Entity({ tableName: 'isometric' })
export class IsometricEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @ManyToOne(() => ProjectEntity, { cascade: [Cascade.ALL] })
  @Index()
  project!: ProjectEntity;

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(() => SheetEntity, (sheet) => sheet.isometric)
  sheets = new Collection<SheetEntity>(this);

  @OneToMany(() => CutListEntity, (cutList) => cutList.isometric)
  cutLists = new Collection<CutListEntity>(this);
}
