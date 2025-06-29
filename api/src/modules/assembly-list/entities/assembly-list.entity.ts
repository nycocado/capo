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
} from '@mikro-orm/core';
import { ApiProperty } from '@nestjs/swagger';
import { IsometricEntity } from '@database/entities';
import { AssemblyListWorkStatusEntity } from '@modules/assembly-list/entities/assembly-list-work-status.entity';

@Entity({ tableName: 'assembly_list' })
export class AssemblyListEntity {
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

  @Property({ type: 'timestamp', defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt!: Date;

  @Property({
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updatedAt!: Date;

  @OneToMany(
    () => AssemblyListWorkStatusEntity,
    (assemblyListWorkStatus) => assemblyListWorkStatus.assemblyList,
  )
  workStatuses = new Collection<AssemblyListWorkStatusEntity>(this);

  constructor(internalId: string, isometric: IsometricEntity) {
    this.internalId = internalId;
    this.isometric = isometric;
  }
}
