import { Entity, Enum, Index, ManyToOne } from "@mikro-orm/decorators/legacy";
import { Cascade } from "@mikro-orm/core";
import { AbstractStatusEventEntity } from "@database/entities";
import {
  PipeLengthEntity,
  PipeLengthStatus,
} from "@modules/pipe-length/entities/pipe-length.entity";

@Entity({ tableName: "pipe_length_status_event" })
@Index({ properties: ["pipeLength", "createdAt"] })
export class PipeLengthStatusEventEntity extends AbstractStatusEventEntity {
  @Enum(() => PipeLengthStatus)
  status!: PipeLengthStatus;

  @ManyToOne(() => PipeLengthEntity, { cascade: [Cascade.ALL] })
  @Index()
  pipeLength!: PipeLengthEntity;
}
