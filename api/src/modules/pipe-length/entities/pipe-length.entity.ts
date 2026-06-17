import {
  Check,
  Entity,
  Enum,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";
import { Cascade, Collection } from "@mikro-orm/core";
import { DiameterEntity, MaterialEntity, PartEntity } from "@database/entities";
import { PipeLengthStatusEventEntity } from "@modules/pipe-length/entities";

export enum PipeLengthStatus {
  TO_DO = "to_do",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

@Entity({ tableName: "pipe_length" })
export class PipeLengthEntity {
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

  // Capturado na transição para in_progress (estágio de corte)
  @Property({ length: 100, nullable: true })
  @Index()
  heatNumber?: string;

  @Enum({ items: () => PipeLengthStatus, default: PipeLengthStatus.TO_DO })
  @Index()
  status: PipeLengthStatus = PipeLengthStatus.TO_DO;

  @ManyToOne(() => MaterialEntity)
  @Index()
  material!: MaterialEntity;

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

  @OneToMany(() => PipeLengthStatusEventEntity, (event) => event.pipeLength)
  statusEvents = new Collection<PipeLengthStatusEventEntity>(this);
}
