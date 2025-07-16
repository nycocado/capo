import {
  Cascade,
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";
import { FittingEntity } from "@modules/fitting/entities";
import { DiameterEntity } from "@database/entities";

@Entity({ tableName: "port" })
@Unique({ properties: ["fitting", "number"] })
export class PortEntity {
  @PrimaryKey()
  id!: number;

  @Property()
  number!: number;

  @ManyToOne(() => FittingEntity, { cascade: [Cascade.ALL] })
  @Index()
  fitting!: FittingEntity;

  @ManyToOne(() => DiameterEntity)
  @Index()
  diameter!: DiameterEntity;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;
}
