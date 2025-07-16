import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";
import { SpoolEntity, RevEntity } from "@database/entities";

@Entity({ tableName: "spool_rev" })
@Unique({ properties: ["spool", "rev"] })
export class SpoolRevEntity {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => SpoolEntity, { cascade: [Cascade.ALL] })
  @Index()
  spool!: SpoolEntity;

  @ManyToOne(() => RevEntity, { cascade: [Cascade.ALL] })
  @Index()
  rev!: RevEntity;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;
}
