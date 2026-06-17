import {
  Check,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";
import { Cascade, Collection } from "@mikro-orm/core";
import {
  FittingTypeEntity,
  MaterialEntity,
  PartEntity,
  PortEntity,
} from "@database/entities";

@Entity({ tableName: "fitting" })
export class FittingEntity {
  @OneToOne(() => PartEntity, {
    owner: true,
    primary: true,
    joinColumn: "id",
    cascade: [Cascade.ALL],
  })
  part!: PartEntity;

  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @Property({ length: 100 })
  description!: string;

  @Property({ type: "decimal", precision: 8, scale: 2 })
  @Check({ expression: "length > 0" })
  length!: number;

  @Property({ type: "decimal", precision: 5, scale: 2 })
  @Check({ expression: "thickness > 0" })
  thickness!: number;

  @Property({ length: 100, nullable: true })
  @Index()
  heatNumber?: string;

  @ManyToOne(() => MaterialEntity)
  @Index()
  material!: MaterialEntity;

  @ManyToOne(() => FittingTypeEntity)
  @Index()
  fittingType!: FittingTypeEntity;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(() => PortEntity, (port) => port.fitting)
  ports = new Collection<PortEntity>(this);
}
