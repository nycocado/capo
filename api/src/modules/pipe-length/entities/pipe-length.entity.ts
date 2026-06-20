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
import { BadRequestException, ConflictException } from "@nestjs/common";
import { DiameterEntity, MaterialEntity, PartEntity } from "@database/entities";
import { UserEntity } from "@modules/user/entities/user.entity";
import { AggregateRoot } from "@common/domain";
import { PipeLengthStatusEventEntity } from "@modules/pipe-length/entities/pipe-length-status-event.entity";
import { PipeLengthStatusChangedEvent } from "@modules/pipe-length/events/pipe-length-status-changed.event";
import { PipeLengthRepository } from "@modules/pipe-length/pipe-length.repository";

export enum PipeLengthStatus {
  TO_DO = "to_do",
  IN_PROGRESS = "in_progress",
  DONE = "done",
}

/** Máquina de estados do corte: to_do → in_progress (exige heat) → done. */
const TRANSITIONS: Record<PipeLengthStatus, PipeLengthStatus[]> = {
  [PipeLengthStatus.TO_DO]: [PipeLengthStatus.IN_PROGRESS],
  [PipeLengthStatus.IN_PROGRESS]: [PipeLengthStatus.DONE],
  [PipeLengthStatus.DONE]: [],
};

@Entity({ tableName: "pipe_length", repository: () => PipeLengthRepository })
export class PipeLengthEntity extends AggregateRoot {
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

  @OneToMany(() => PipeLengthStatusEventEntity, (event) => event.pipeLength, {
    cascade: [Cascade.PERSIST],
  })
  statusEvents = new Collection<PipeLengthStatusEventEntity>(this);

  /**
   * Inicia o corte: regista o heat_number e move to_do → in_progress.
   *
   * @throws ConflictException Se o item não estiver em to_do
   * @throws BadRequestException Se não houver heat_number (novo ou já existente)
   */
  startCutting(
    heatNumber: string | undefined,
    by: UserEntity,
    notes?: string,
  ): void {
    this.assertTransition(PipeLengthStatus.IN_PROGRESS);
    const heat = heatNumber ?? this.heatNumber;
    if (!heat) {
      throw new BadRequestException("heatNumber is required to start cutting");
    }
    this.heatNumber = heat;
    this.applyStatus(PipeLengthStatus.IN_PROGRESS, by, notes);
  }

  /**
   * Conclui o corte: move in_progress → done.
   *
   * @throws ConflictException Se o item não estiver em in_progress
   */
  finishCutting(by: UserEntity, notes?: string): void {
    this.assertTransition(PipeLengthStatus.DONE);
    this.applyStatus(PipeLengthStatus.DONE, by, notes);
  }

  private applyStatus(
    status: PipeLengthStatus,
    by: UserEntity,
    notes?: string,
  ): void {
    this.status = status;
    const event = new PipeLengthStatusEventEntity();
    event.status = status;
    event.pipeLength = this;
    event.notes = notes;
    event.createdBy = by;
    this.statusEvents.add(event);
    this.raise(new PipeLengthStatusChangedEvent(this, by.id));
  }

  private assertTransition(next: PipeLengthStatus): void {
    if (!TRANSITIONS[this.status].includes(next)) {
      throw new ConflictException(
        `Invalid status transition: ${this.status} -> ${next}`,
      );
    }
  }
}
