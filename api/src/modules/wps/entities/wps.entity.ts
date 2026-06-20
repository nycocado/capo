import {
  Check,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";
import { Collection } from "@mikro-orm/core";
import { WeldEntity } from "@modules/weld/entities/weld.entity";

@Entity({ tableName: "wps" })
export class WpsEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @Property({ length: 255 })
  document!: string;

  @Property({ type: "decimal", precision: 4, scale: 2 })
  @Check({ expression: "tpi > 0" })
  tpi!: number;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(() => WeldEntity, (weld) => weld.wps)
  welds = new Collection<WeldEntity>(this);
}
