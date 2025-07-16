import {
  Cascade,
  Check,
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";
import { IsometricEntity, RevEntity } from "@database/entities";

@Entity({ tableName: "sheet" })
@Unique({ properties: ["isometric", "number"] })
export class SheetEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  @Check({ expression: "number > 0" })
  @Index()
  number!: number;

  @ManyToOne(() => IsometricEntity, { cascade: [Cascade.ALL] })
  @Index()
  isometric!: IsometricEntity;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(() => RevEntity, (rev) => rev.sheet)
  revisions = new Collection<RevEntity>(this);
}
