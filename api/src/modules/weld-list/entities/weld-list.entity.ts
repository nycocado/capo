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
import { SpoolEntity } from "@database/entities";
import { UserEntity } from "@modules/user/entities/user.entity";
import { ListProgress } from "@shared/types";
import { AggregateRoot } from "@common/domain";
import { WeldListClaimChangedEvent } from "@modules/weld-list/events/weld-list-claim-changed.event";
import { WeldListRepository } from "@modules/weld-list/weld-list.repository";

export interface ClaimContext {
  available: boolean;
  progress: ListProgress;
}

@Entity({ tableName: "weld_list", repository: () => WeldListRepository })
export class WeldListEntity extends AggregateRoot {
  @PrimaryKey()
  id!: number;

  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @ManyToOne(() => SpoolEntity, { cascade: [Cascade.ALL] })
  @Unique()
  @Index()
  spool!: SpoolEntity;

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
  weldCount?: number;

  claimBy(user: UserEntity, ctx: ClaimContext): void {
    if (!ctx.available)
      throw new ConflictException("Prior stage is not complete");
    if (ctx.progress === ListProgress.DONE)
      throw new ConflictException("Cannot claim a completed order");
    if (this.claimedBy && this.claimedBy.id !== user.id)
      throw new ConflictException("Order already claimed by another user");
    this.claimedBy = user;
    this.claimedAt = new Date();
    this.raise(new WeldListClaimChangedEvent(this.id, user.id));
  }

  release(): void {
    this.claimedBy = undefined;
    this.claimedAt = undefined;
    this.raise(new WeldListClaimChangedEvent(this.id, null));
  }

  reassignTo(user: UserEntity): void {
    this.claimedBy = user;
    this.claimedAt = new Date();
    this.raise(new WeldListClaimChangedEvent(this.id, user.id));
  }
}
