import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { UserEntity } from "@modules/user/entities";

/**
 * Base das trilhas de auditoria de status (append-only).
 *
 * Cada estágio tem a sua tabela concreta (`pipe_length_status_event`,
 * `joint_status_event`, `weld_status_event`); a coluna `status` e a FK do item
 * rastreado ficam na entidade concreta, pois variam por estágio.
 */
@Entity({ abstract: true })
export abstract class AbstractStatusEventEntity {
  @PrimaryKey()
  id!: number;

  @Property({ type: "text", nullable: true })
  notes?: string;

  @ManyToOne(() => UserEntity, { nullable: true, deleteRule: "set null" })
  @Index()
  createdBy?: UserEntity;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;
}
