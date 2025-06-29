import {
  Cascade,
  Check,
  Entity,
  Index,
  ManyToOne,
  OneToOne,
  Property,
  Unique,
} from '@mikro-orm/core';
import { DiameterEntity, MaterialEntity, PartEntity } from '@database/entities';

@Entity({ tableName: 'pipe_length' })
export class PipeLengthEntity {
  @OneToOne(() => PartEntity, {
    owner: true,
    primary: true,
    joinColumn: 'id',
    cascade: [Cascade.ALL],
  })
  part!: PartEntity;

  @Property({ length: 100 })
  @Unique()
  internalId!: string;

  @Property({ length: 100 })
  description!: string;

  @Property({ type: 'decimal', precision: 8, scale: 2 })
  @Check({ expression: 'length > 0' })
  length!: number;

  @Property({ type: 'decimal', precision: 5, scale: 2 })
  @Check({ expression: 'thickness > 0' })
  thickness!: number;

  @Property({ length: 100, nullable: true })
  @Index()
  heatNumber?: string;

  @ManyToOne(() => MaterialEntity)
  @Index()
  material!: MaterialEntity;

  @ManyToOne(() => DiameterEntity)
  @Index()
  diameter!: DiameterEntity;
}
