import {
  Cascade,
  Collection,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";
import { SheetEntity, SpoolEntity, SpoolRevEntity } from "@database/entities";

@Entity({ tableName: "rev" })
@Unique({ properties: ["sheet", "revisionNumber"] })
export class RevEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  document!: string;

  @Property({ length: 10 })
  @Index()
  revisionNumber!: string;

  @ManyToOne(() => SheetEntity, { cascade: [Cascade.ALL] })
  @Index()
  sheet!: SheetEntity;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @ManyToMany({
    entity: () => SpoolEntity,
    pivotEntity: () => SpoolRevEntity,
    cascade: [Cascade.ALL],
  })
  spools = new Collection<SpoolEntity>(this);
}
