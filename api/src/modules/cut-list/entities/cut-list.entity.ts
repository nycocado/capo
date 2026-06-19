import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";
import { Cascade } from "@mikro-orm/core";
import { IsometricEntity } from "@database/entities";
import { UserEntity } from "@modules/user/entities";
import { ListProgress } from "@shared/types";

@Entity({ tableName: "cut_list" })
export class CutListEntity {
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

  // Derivados dos itens (preenchidos pelo service; não persistidos)
  @Property({ persist: false })
  progress?: ListProgress;

  @Property({ persist: false })
  available?: boolean;

  /** Total de pipe_lengths do isométrico (para a lista leve, sem a árvore). */
  @Property({ persist: false })
  pipeCount?: number;
}
