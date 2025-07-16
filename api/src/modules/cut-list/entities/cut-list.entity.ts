import {
  Cascade,
  Collection,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import { IsometricEntity } from "@database/entities";
import { CutListWorkStatusEntity } from "@modules/cut-list/entities/cut-list-work-status.entity";

@Entity({ tableName: "cut_list" })
export class CutListEntity {
  @ApiProperty()
  @PrimaryKey()
  id!: number;

  @ApiProperty()
  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @ApiProperty()
  @ManyToOne(() => IsometricEntity, { cascade: [Cascade.ALL] })
  @Index()
  isometric!: IsometricEntity;

  @Property({ type: "timestamp", defaultRaw: "CURRENT_TIMESTAMP" })
  createdAt!: Date;

  @Property({
    type: "timestamp",
    defaultRaw: "CURRENT_TIMESTAMP",
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(
    () => CutListWorkStatusEntity,
    (cutListWorkStatus) => cutListWorkStatus.cutList,
  )
  workStatuses = new Collection<CutListWorkStatusEntity>(this);
}
