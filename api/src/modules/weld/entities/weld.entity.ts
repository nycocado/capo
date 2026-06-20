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
import { BadRequestException, ConflictException } from "@nestjs/common";
import { JointEntity } from "@modules/joint/entities/joint.entity";
import { FillerMaterialEntity } from "@modules/filler-material/entities/filler-material.entity";
import { WpsEntity } from "@modules/wps/entities/wps.entity";
import { UserEntity } from "@modules/user/entities/user.entity";
import { AggregateRoot } from "@common/domain";
import { WeldStatusEventEntity } from "@modules/weld/entities/weld-status-event.entity";
import { WeldStatusChangedEvent } from "@modules/weld/events/weld-status-changed.event";
import { WeldRepository } from "@modules/weld/weld.repository";

export enum WeldStatus {
  TO_DO = "to_do",
  DONE = "done",
}

/** Máquina de estados da solda: to_do → done (exige filler + wps). */
const TRANSITIONS: Record<WeldStatus, WeldStatus[]> = {
  [WeldStatus.TO_DO]: [WeldStatus.DONE],
  [WeldStatus.DONE]: [],
};

@Entity({ tableName: "weld", repository: () => WeldRepository })
export class WeldEntity extends AggregateRoot {
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

  @OneToMany(() => WeldStatusEventEntity, (event) => event.weld, {
    cascade: [Cascade.PERSIST],
  })
  statusEvents = new Collection<WeldStatusEventEntity>(this);

  /**
   * Conclui a solda: regista filler material + wps e move to_do → done.
   *
   * @throws ConflictException Se o item não estiver em to_do
   * @throws BadRequestException Se faltar filler material ou wps (novo ou existente)
   */
  complete(
    filler: FillerMaterialEntity | undefined,
    wps: WpsEntity | undefined,
    by: UserEntity,
    notes?: string,
  ): void {
    this.assertTransition(WeldStatus.DONE);
    const resolvedFiller = filler ?? this.fillerMaterial;
    const resolvedWps = wps ?? this.wps;
    if (!resolvedFiller || !resolvedWps) {
      throw new BadRequestException(
        "fillerMaterial and wps are required to finish a weld",
      );
    }
    this.fillerMaterial = resolvedFiller;
    this.wps = resolvedWps;
    this.status = WeldStatus.DONE;
    const event = new WeldStatusEventEntity();
    event.status = WeldStatus.DONE;
    event.weld = this;
    event.notes = notes;
    event.createdBy = by;
    this.statusEvents.add(event);
    this.raise(new WeldStatusChangedEvent(this, by.id));
  }

  private assertTransition(next: WeldStatus): void {
    if (!TRANSITIONS[this.status].includes(next)) {
      throw new ConflictException(
        `Invalid status transition: ${this.status} -> ${next}`,
      );
    }
  }
}
