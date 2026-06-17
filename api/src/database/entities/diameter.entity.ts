import {
  Check,
  Entity,
  Index,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";
import { Collection } from "@mikro-orm/core";
import { PipeLengthEntity } from "@modules/pipe-length/entities";
import { PortEntity } from "@database/entities";

@Entity({ tableName: "diameter" })
export class DiameterEntity {
  @PrimaryKey()
  id!: number;

  @Property({ type: "decimal", precision: 6, scale: 2 })
  @Check({ expression: "nominal_mm > 0" })
  @Unique()
  nominalMm!: number;

  @Property({ type: "decimal", precision: 5, scale: 3 })
  @Check({ expression: "nominal_inch > 0" })
  @Index()
  nominalInch!: number;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(() => PipeLengthEntity, (pipeLength) => pipeLength.diameter)
  pipeLengths = new Collection<PipeLengthEntity>(this);

  @OneToMany(() => PortEntity, (port) => port.diameter)
  ports = new Collection<PortEntity>(this);
}
