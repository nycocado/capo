import { Injectable } from '@nestjs/common';
import { FittingEntity } from '@modules/fitting/entities';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, QueryOrder } from '@mikro-orm/mariadb';

@Injectable()
export class FittingRepository {
  constructor(
    @InjectRepository(FittingEntity)
    private readonly fittingRepository: EntityRepository<FittingEntity>,
  ) {}

  private readonly FULL_POPULATE_FIELDS = [
    'part.workStatuses.workStatusType',
    'material',
    'fittingType',
    'ports.diameter',
  ] as const;

  async findById(id: number): Promise<FittingEntity | null> {
    return this.fittingRepository.findOne({ part: { id: id } });
  }

  async findByIdOrFail(id: number): Promise<FittingEntity> {
    return this.fittingRepository.findOneOrFail({ part: { id: id } });
  }

  async findAll(): Promise<FittingEntity[]> {
    return this.fittingRepository.findAll();
  }

  async findFullById(id: number): Promise<FittingEntity | null> {
    return this.fittingRepository.findOne(
      { part: { id: id } },
      {
        populate: this.FULL_POPULATE_FIELDS,
        orderBy: {
          part: {
            workStatuses: {
              id: QueryOrder.ASC,
            },
          },
          ports: { number: QueryOrder.ASC },
        },
      },
    );
  }

  async findFullByIdOrFail(id: number): Promise<FittingEntity> {
    return this.fittingRepository.findOneOrFail(
      { part: { id: id } },
      {
        populate: this.FULL_POPULATE_FIELDS,
        orderBy: {
          part: {
            workStatuses: {
              id: QueryOrder.ASC,
            },
          },
          ports: { number: QueryOrder.ASC },
        },
      },
    );
  }

  async findFullAll(): Promise<FittingEntity[]> {
    return this.fittingRepository.findAll({
      populate: this.FULL_POPULATE_FIELDS,
      orderBy: {
        part: {
          id: QueryOrder.ASC,
          workStatuses: {
            id: QueryOrder.ASC,
          },
        },
        ports: { number: QueryOrder.ASC },
      },
    });
  }
}
