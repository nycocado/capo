import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";
import { Cascade } from "@mikro-orm/core";
import { ConflictException } from "@nestjs/common";
import { IsometricEntity } from "@database/entities";
import { UserEntity } from "@modules/user/entities";
import { ListProgress } from "@shared/types";
import { AggregateRoot } from "@common/domain";
import { CutListClaimChangedEvent } from "@modules/cut-list/events";
import { CutListRepository } from "@modules/cut-list/cut-list.repository";

/** Contexto de gating/progresso usado para validar um claim. */
export interface ClaimContext {
  available: boolean;
  progress: ListProgress;
}

@Entity({ tableName: "cut_list", repository: () => CutListRepository })
export class CutListEntity extends AggregateRoot {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @ManyToOne(() => IsometricEntity, { cascade: [Cascade.ALL] })
  @Unique()
  @Index()
  isometric!: IsometricEntity;

  @ManyToOne(() => UserEntity, { nullable: true, deleteRule: "set null" })
  @Index()
  claimedBy?: UserEntity;

  @Property({ type: "timestamp", nullable: true })
  claimedAt?: Date;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  // Derivados dos itens (preenchidos pelo repositório; não persistidos)
  @Property({ persist: false })
  progress?: ListProgress;

  @Property({ persist: false })
  available?: boolean;

  /** Total de pipe_lengths do isométrico (para a lista leve, sem a árvore). */
  @Property({ persist: false })
  pipeCount?: number;

  /**
   * Reclama a ordem para o utilizador (lock exclusivo).
   *
   * @throws ConflictException Se o estágio anterior estiver incompleto, a ordem
   *   já estiver concluída ou já reclamada por outro utilizador
   */
  claimBy(user: UserEntity, ctx: ClaimContext): void {
    if (!ctx.available) {
      throw new ConflictException("Prior stage is not complete");
    }
    if (ctx.progress === ListProgress.DONE) {
      throw new ConflictException("Cannot claim a completed order");
    }
    if (this.claimedBy && this.claimedBy.id !== user.id) {
      throw new ConflictException("Order already claimed by another user");
    }
    this.claimedBy = user;
    this.claimedAt = new Date();
    this.raise(new CutListClaimChangedEvent(this.id, user.id));
  }

  /** Liberta o lock da ordem. */
  release(): void {
    this.claimedBy = undefined;
    this.claimedAt = undefined;
    this.raise(new CutListClaimChangedEvent(this.id, null));
  }

  /** Reatribui o lock a outro utilizador (operação de administrador). */
  reassignTo(user: UserEntity): void {
    this.claimedBy = user;
    this.claimedAt = new Date();
    this.raise(new CutListClaimChangedEvent(this.id, user.id));
  }
}
