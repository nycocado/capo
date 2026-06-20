import {
  Entity,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { UserEntity } from "@modules/user/entities/user.entity";

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
