import {
  Entity,
  Enum,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { Cascade, Collection } from "@mikro-orm/core";
import { JointEntity } from "@modules/joint/entities";
import { FillerMaterialEntity } from "@modules/filler-material/entities";
import { WpsEntity } from "@modules/wps/entities";
import { WeldStatusEventEntity } from "@modules/weld/entities";

export enum WeldStatus {
  TO_DO = "to_do",
  DONE = "done",
}

@Entity({ tableName: "weld" })
export class WeldEntity {
  @PrimaryKey()
  id!: number;

  @Property({ length: 10 })
  number!: string;

  @ManyToOne(() => JointEntity, { cascade: [Cascade.ALL] })
  @Index()
  joint!: JointEntity;

  // Capturados na transição para done (estágio de solda)
  @ManyToOne(() => FillerMaterialEntity, {
    nullable: true,
    deleteRule: "set null",
  })
  @Index()
  fillerMaterial?: FillerMaterialEntity;

  @ManyToOne(() => WpsEntity, { nullable: true, deleteRule: "set null" })
  @Index()
  wps?: WpsEntity;

  @Enum({ items: () => WeldStatus, default: WeldStatus.TO_DO })
  @Index()
  status: WeldStatus = WeldStatus.TO_DO;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(() => WeldStatusEventEntity, (event) => event.weld)
  statusEvents = new Collection<WeldStatusEventEntity>(this);
}
