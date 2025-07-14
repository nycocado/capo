import { InjectRepository } from '@mikro-orm/nestjs';
import { CutListEntity } from '@modules/cut-list/entities';
import {
  EntityRepository,
  LoadStrategy,
  QueryOrder,
  Transactional,
} from '@mikro-orm/mariadb';
import {
  PartType,
  WorkStatusType,
  WorkStatusTypeEntity,
} from '@database/entities';
import { Injectable } from '@nestjs/common';
import { UserEntity } from '@modules/user/entities';
import { CutListWorkStatusEntity } from '@modules/cut-list/entities/cut-list-work-status.entity';

@Injectable()
export class CutListRepository {
  constructor(
    @InjectRepository(CutListEntity)
    private readonly cutListRepository: EntityRepository<CutListEntity>,
  ) {}

  private readonly FULL_POPULATE_FIELDS = [
    'workStatuses.workStatusType',
    'isometric.sheets.revisions.spools.joints.part1.workStatuses.workStatusType',
    'isometric.sheets.revisions.spools.joints.part1.pipeLength.material',
    'isometric.sheets.revisions.spools.joints.part1.pipeLength.diameter',
    'isometric.sheets.revisions.spools.joints.part1.pipeLength.part.workStatuses.workStatusType',
    'isometric.sheets.revisions.spools.joints.part2.workStatuses.workStatusType',
    'isometric.sheets.revisions.spools.joints.part2.pipeLength.material',
    'isometric.sheets.revisions.spools.joints.part2.pipeLength.diameter',
    'isometric.sheets.revisions.spools.joints.part2.pipeLength.part.workStatuses.workStatusType',
  ] as const;

  private readonly MINIMAL_POPULATE_FIELDS = [
    'workStatuses.workStatusType',
    'isometric.sheets.revisions',
  ] as const;

  async findMinimalByPipeLengthIdOrFail(
    pipeLengthId: number,
  ): Promise<CutListEntity> {
    return this.cutListRepository.findOneOrFail(
      {
        isometric: {
          sheets: {
            revisions: {
              spools: {
                joints: {
                  $or: [
                    {
                      part1: {
                        id: pipeLengthId,
                        type: PartType.PIPE_LENGTH,
                      },
                    },
                    {
                      part2: {
                        id: pipeLengthId,
                        type: PartType.PIPE_LENGTH,
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
      {
        populate: this.MINIMAL_POPULATE_FIELDS,
        orderBy: {
          isometric: {
            sheets: {
              revisions: {
                revisionNumber: QueryOrder.ASC,
              },
            },
          },
        },
        strategy: LoadStrategy.SELECT_IN,
      },
    );
  }

  async findFullByIdOrFail(id: number): Promise<CutListEntity> {
    return this.cutListRepository.findOneOrFail(
      {
        id: id,
        isometric: {
          sheets: {
            revisions: {
              spools: {
                joints: {
                  part1: { type: PartType.PIPE_LENGTH },
                  part2: { type: PartType.PIPE_LENGTH },
                },
              },
            },
          },
        },
      },
      {
        populate: this.FULL_POPULATE_FIELDS,
        orderBy: {
          isometric: {
            sheets: {
              revisions: {
                revisionNumber: QueryOrder.ASC,
                spools: {
                  joints: {
                    part1: {
                      id: QueryOrder.ASC,
                      workStatuses: {
                        id: QueryOrder.ASC,
                      },
                    },
                    part2: {
                      id: QueryOrder.ASC,
                      workStatuses: {
                        id: QueryOrder.ASC,
                      },
                    },
                  },
                },
              },
            },
          },
          workStatuses: {
            id: QueryOrder.ASC,
          },
        },
        strategy: LoadStrategy.SELECT_IN,
      },
    );
  }

  async findFullAll(): Promise<CutListEntity[]> {
    return this.cutListRepository.findAll({
      populate: this.FULL_POPULATE_FIELDS,
      orderBy: {
        id: QueryOrder.ASC,
        isometric: {
          sheets: {
            revisions: {
              revisionNumber: QueryOrder.ASC,
              spools: {
                joints: {
                  part1: {
                    id: QueryOrder.ASC,
                    workStatuses: {
                      id: QueryOrder.ASC,
                    },
                  },
                  part2: {
                    id: QueryOrder.ASC,
                    workStatuses: {
                      id: QueryOrder.ASC,
                    },
                  },
                },
              },
            },
          },
        },
        workStatuses: {
          id: QueryOrder.ASC,
        },
      },
      strategy: LoadStrategy.SELECT_IN,
    });
  }

  async populateToFull(cutList: CutListEntity): Promise<CutListEntity> {
    const em = this.cutListRepository.getEntityManager();
    return em.populate(cutList, this.FULL_POPULATE_FIELDS, {
      strategy: LoadStrategy.SELECT_IN,
    });
  }

  async updateWorkStatusToWorking(
    cutList: CutListEntity,
    userId: number,
  ): Promise<CutListEntity> {
    return this.updateWorkStatus(cutList, userId, WorkStatusType.WORKING);
  }

  async updateWorkStatusToFinished(
    cutList: CutListEntity,
    userId: number,
  ): Promise<CutListEntity> {
    return this.updateWorkStatus(cutList, userId, WorkStatusType.FINISHED);
  }

  @Transactional()
  async updateWorkStatus(
    cutList: CutListEntity,
    userId: number,
    workStatusType: string,
  ): Promise<CutListEntity> {
    const em = this.cutListRepository.getEntityManager();
    const workStatusTypeEntity = await em.findOneOrFail(WorkStatusTypeEntity, {
      name: workStatusType,
    });

    const newWorkStatus = new CutListWorkStatusEntity(
      cutList,
      workStatusTypeEntity,
      undefined,
      em.getReference(UserEntity, userId),
    );

    cutList.workStatuses.add(newWorkStatus);
    em.persist(newWorkStatus);
    em.persist(cutList);
    await em.flush();
    return cutList;
  }
}
