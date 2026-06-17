import { Entity, Enum, Index, ManyToOne } from "@mikro-orm/decorators/legacy";
import { Cascade } from "@mikro-orm/core";
import { AbstractStatusEventEntity } from "@database/entities";
import { JointEntity, JointStatus } from "@modules/joint/entities";

@Entity({ tableName: "joint_status_event" })
@Index({ properties: ["joint", "createdAt"] })
export class JointStatusEventEntity extends AbstractStatusEventEntity {
  @Enum(() => JointStatus)
  status!: JointStatus;

  @ManyToOne(() => JointEntity, { cascade: [Cascade.ALL] })
  @Index()
  joint!: JointEntity;
}
