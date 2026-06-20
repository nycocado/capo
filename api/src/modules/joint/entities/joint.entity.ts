import {
  Check,
  Entity,
  Enum,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/decorators/legacy";
import { Cascade, Collection } from "@mikro-orm/core";
import { ConflictException } from "@nestjs/common";
import { PartEntity, SpoolEntity } from "@database/entities";
import { WeldEntity } from "@modules/weld/entities";
import { UserEntity } from "@modules/user/entities";
import { AggregateRoot } from "@common/domain";
import { JointStatusEventEntity } from "@modules/joint/entities";
import { JointStatusChangedEvent } from "@modules/joint/events";
import { JointRepository } from "@modules/joint/joint.repository";

export enum JointStatus {
  TO_DO = "to_do",
  DONE = "done",
}

/** Máquina de estados da montagem: to_do → done. */
const TRANSITIONS: Record<JointStatus, JointStatus[]> = {
  [JointStatus.TO_DO]: [JointStatus.DONE],
  [JointStatus.DONE]: [],
};

@Entity({ tableName: "joint", repository: () => JointRepository })
@Check({ expression: "part1_id != part2_id" })
export class JointEntity extends AggregateRoot {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => PartEntity, { cascade: [Cascade.ALL] })
  @Index()
  part1!: PartEntity;

  @ManyToOne(() => PartEntity, { cascade: [Cascade.ALL] })
  @Index()
  part2!: PartEntity;

  @ManyToOne(() => SpoolEntity, { cascade: [Cascade.ALL] })
  @Index()
  spool!: SpoolEntity;

  @Enum({ items: () => JointStatus, default: JointStatus.TO_DO })
  @Index()
  status: JointStatus = JointStatus.TO_DO;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(() => WeldEntity, (weld) => weld.joint)
  welds = new Collection<WeldEntity>(this);

  @OneToMany(() => JointStatusEventEntity, (event) => event.joint, {
    cascade: [Cascade.PERSIST],
  })
  statusEvents = new Collection<JointStatusEventEntity>(this);

  /**
   * Conclui a montagem: move to_do → done.
   *
   * @throws ConflictException Se o item não estiver em to_do
   */
  complete(by: UserEntity, notes?: string): void {
    this.assertTransition(JointStatus.DONE);
    this.status = JointStatus.DONE;
    const event = new JointStatusEventEntity();
    event.status = JointStatus.DONE;
    event.joint = this;
    event.notes = notes;
    event.createdBy = by;
    this.statusEvents.add(event);
    this.raise(new JointStatusChangedEvent(this, by.id));
  }

  private assertTransition(next: JointStatus): void {
    if (!TRANSITIONS[this.status].includes(next)) {
      throw new ConflictException(
        `Invalid status transition: ${this.status} -> ${next}`,
      );
    }
  }
}
