import {
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";
import { Cascade, Collection } from "@mikro-orm/core";
import { ProjectEntity } from "@modules/project/entities";
import { SpoolEntity } from "@database/entities";

@Entity({ tableName: "isometric" })
export class IsometricEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @ManyToOne(() => ProjectEntity, { cascade: [Cascade.ALL] })
  @Index()
  project!: ProjectEntity;

  @Property({ length: 255 })
  document!: string;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(() => SpoolEntity, (spool) => spool.isometric)
  spools = new Collection<SpoolEntity>(this);
}
