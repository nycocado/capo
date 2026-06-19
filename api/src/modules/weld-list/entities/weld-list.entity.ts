import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/decorators/legacy";
import { Cascade } from "@mikro-orm/core";
import { SpoolEntity } from "@database/entities";
import { UserEntity } from "@modules/user/entities";
import { ListProgress } from "@shared/types";

@Entity({ tableName: "weld_list" })
export class WeldListEntity {
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

  // Derivados dos itens (preenchidos pelo service; não persistidos)
  @Property({ persist: false })
  progress?: ListProgress;

  @Property({ persist: false })
  available?: boolean;

  /** Total de welds do spool (para a lista leve, sem a árvore). */
  @Property({ persist: false })
  weldCount?: number;
}
