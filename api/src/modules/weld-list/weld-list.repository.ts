import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { WeldListEntity } from '@modules/weld-list/entities';
import {
  EntityRepository,
  LoadStrategy,
  QueryOrder,
  Transactional,
} from '@mikro-orm/mariadb';
import {
  SpoolEntity,
  WorkStatusType,
  WorkStatusTypeEntity,
} from '@database/entities';
import { UserEntity } from '@modules/user/entities';
import { WeldListWorkStatusEntity } from '@modules/weld-list/entities/weld-list-work-status.entity';

@Injectable()
export class WeldListRepository {
  constructor(
    @InjectRepository(WeldListEntity)
    private readonly weldListRepository: EntityRepository<WeldListEntity>,
  ) {}

  private readonly FULL_POPULATE_FIELDS = [
    'workStatuses.workStatusType',
    'spool.joints.welds.workStatuses.workStatusType',
    'spool.joints.welds.fillerMaterial',
    'spool.joints.welds.wps',
  ] as const;

  private readonly MINIMAL_POPULATE_FIELDS = [
    'workStatuses.workStatusType',
    'spool',
  ] as const;

  async findMinimalByIdOrFail(id: number): Promise<WeldListEntity> {
    return this.weldListRepository.findOneOrFail(id, {
      populate: this.MINIMAL_POPULATE_FIELDS,
      orderBy: {
        spool: { id: QueryOrder.ASC },
        workStatuses: { id: QueryOrder.ASC },
      },
      strategy: LoadStrategy.SELECT_IN,
    });
  }

  async findMinimalAll(): Promise<WeldListEntity[]> {
    return this.weldListRepository.findAll({
      populate: this.MINIMAL_POPULATE_FIELDS,
      orderBy: {
        id: QueryOrder.ASC,
        spool: { id: QueryOrder.ASC },
        workStatuses: { id: QueryOrder.ASC },
      },
      strategy: LoadStrategy.SELECT_IN,
    });
  }

  async findMinimalByWeldIdOrFail(weldId: number): Promise<WeldListEntity> {
    return this.weldListRepository.findOneOrFail(
      {
        spool: {
          joints: {
            welds: {
              id: weldId,
            },
          },
        },
      },
      {
        populate: this.MINIMAL_POPULATE_FIELDS,
        orderBy: {
          spool: { id: QueryOrder.ASC },
          workStatuses: { id: QueryOrder.ASC },
        },
        strategy: LoadStrategy.SELECT_IN,
      },
    );
  }

  async findFullByIdOrFail(id: number): Promise<WeldListEntity> {
    return this.weldListRepository.findOneOrFail(id, {
      populate: this.FULL_POPULATE_FIELDS,
      orderBy: {
        spool: {
          id: QueryOrder.ASC,
          joints: {
            welds: {
              id: QueryOrder.ASC,
              workStatuses: {
                id: QueryOrder.ASC,
              },
            },
          },
        },
        workStatuses: { id: QueryOrder.ASC },
      },
      strategy: LoadStrategy.SELECT_IN,
    });
  }

  async findFullByIdsOrFail(ids: number[]): Promise<WeldListEntity[]> {
    return this.weldListRepository.find(
      { id: { $in: ids } },
      {
        populate: this.FULL_POPULATE_FIELDS,
        orderBy: {
          spool: {
            id: QueryOrder.ASC,
            joints: {
              welds: {
                id: QueryOrder.ASC,
                workStatuses: {
                  id: QueryOrder.ASC,
                },
              },
            },
          },
          workStatuses: { id: QueryOrder.ASC },
        },
        strategy: LoadStrategy.SELECT_IN,
      },
    );
  }

  async findFullAll(): Promise<WeldListEntity[]> {
    return this.weldListRepository.findAll({
      populate: this.FULL_POPULATE_FIELDS,
      orderBy: {
        id: QueryOrder.ASC,
        spool: {
          id: QueryOrder.ASC,
          joints: {
            welds: {
              id: QueryOrder.ASC,
              workStatuses: {
                id: QueryOrder.ASC,
              },
            },
          },
        },
        workStatuses: { id: QueryOrder.ASC },
      },
      strategy: LoadStrategy.SELECT_IN,
    });
  }

  async populateToFull(weldList: WeldListEntity): Promise<WeldListEntity> {
    const em = this.weldListRepository.getEntityManager();
    return em.populate(weldList, this.FULL_POPULATE_FIELDS, {
      strategy: LoadStrategy.SELECT_IN,
    });
  }

  async updateWorkStatusToWorking(
    weldList: WeldListEntity,
    userId: number,
  ): Promise<WeldListEntity> {
    return this.updateWorkStatus(weldList, userId, WorkStatusType.WORKING);
  }

  async updateWorkStatusToFinished(
    weldList: WeldListEntity,
    userId: number,
  ): Promise<WeldListEntity> {
    return this.updateWorkStatus(weldList, userId, WorkStatusType.FINISHED);
  }

  @Transactional()
  async updateWorkStatus(
    weldList: WeldListEntity,
    userId: number,
    workStatusType: string,
  ): Promise<WeldListEntity> {
    const em = this.weldListRepository.getEntityManager();
    const workStatusTypeEntity = await em.findOneOrFail(WorkStatusTypeEntity, {
      name: workStatusType,
    });

    const newWorkStatus = new WeldListWorkStatusEntity(
      weldList,
      workStatusTypeEntity,
      undefined,
      em.getReference(UserEntity, userId),
    );

    weldList.workStatuses.add(newWorkStatus);
    em.persist(newWorkStatus);
    em.persist(weldList);
    await em.flush();
    return weldList;
  }

  @Transactional()
  async create(spoolId: number, userId: number): Promise<WeldListEntity> {
    const em = this.weldListRepository.getEntityManager();

    const weldList = new WeldListEntity(
      'default',
      em.getReference(SpoolEntity, spoolId),
    );

    const workStatusType = await em.findOneOrFail(WorkStatusTypeEntity, {
      name: WorkStatusType.TO_DO,
    });

    const workStatus = new WeldListWorkStatusEntity(
      weldList,
      workStatusType,
      undefined,
      em.getReference(UserEntity, userId),
    );

    weldList.workStatuses.add(workStatus);
    em.persist(weldList);
    em.persist(workStatus);
    await em.flush();

    weldList.internalId = `WL${weldList.id.toString().padStart(4, '0')}`;
    em.persist(weldList);
    await em.flush();
    return weldList;
  }
}
