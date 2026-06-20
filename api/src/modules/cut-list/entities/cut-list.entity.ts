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
import { UserEntity } from "@modules/user/entities/user.entity";
import { ListProgress } from "@shared/types";
import { AggregateRoot } from "@common/domain";
import { CutListClaimChangedEvent } from "@modules/cut-list/events/cut-list-claim-changed.event";
import { CutListRepository } from "@modules/cut-list/cut-list.repository";

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

  @Property({ persist: false })
  progress?: ListProgress;

  @Property({ persist: false })
  available?: boolean;

  @Property({ persist: false })
  pipeCount?: number;

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

  release(): void {
    this.claimedBy = undefined;
    this.claimedAt = undefined;
    this.raise(new CutListClaimChangedEvent(this.id, null));
  }

  reassignTo(user: UserEntity): void {
    this.claimedBy = user;
    this.claimedAt = new Date();
    this.raise(new CutListClaimChangedEvent(this.id, user.id));
  }
}
