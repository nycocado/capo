import { Entity, Enum, Index, ManyToOne } from "@mikro-orm/decorators/legacy";
import { Cascade } from "@mikro-orm/core";
import { AbstractStatusEventEntity } from "@database/entities";
import { WeldEntity, WeldStatus } from "@modules/weld/entities/weld.entity";

@Entity({ tableName: "weld_status_event" })
@Index({ properties: ["weld", "createdAt"] })
export class WeldStatusEventEntity extends AbstractStatusEventEntity {
  @Enum(() => WeldStatus)
  status!: WeldStatus;

  @ManyToOne(() => WeldEntity, { cascade: [Cascade.ALL] })
  @Index()
  weld!: WeldEntity;
}
