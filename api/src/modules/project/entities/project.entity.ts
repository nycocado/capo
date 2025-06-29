import {
  Entity,
  PrimaryKey,
  Property,
  Unique,
  OneToMany,
  Collection,
  Index,
} from '@mikro-orm/core';
import { IsometricEntity } from '@database/entities';

@Entity({ tableName: 'project' })
export class ProjectEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @Property({ length: 60 })
  @Index()
  name!: string;

  @Property({ length: 60 })
  @Index()
  client!: string;

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(() => IsometricEntity, (isometric) => isometric.project)
  isometrics = new Collection<IsometricEntity>(this);
}
