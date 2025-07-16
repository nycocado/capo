import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import {
  EntityRepository,
  LoadStrategy,
  QueryOrder,
  Transactional,
} from "@mikro-orm/mariadb";
import {
  IsometricEntity,
  WorkStatusType,
  WorkStatusTypeEntity,
} from "@database/entities";
import { UserEntity } from "@modules/user/entities";
import { AssemblyListWorkStatusEntity } from "@modules/assembly-list/entities/assembly-list-work-status.entity";

@Injectable()
export class AssemblyListRepository {
  constructor(
    @InjectRepository(AssemblyListEntity)
    private readonly assemblyListRepository: EntityRepository<AssemblyListEntity>,
  ) {}

  private readonly FULL_POPULATE_FIELDS = [
    "workStatuses.workStatusType",
    "isometric.sheets.revisions.spools.joints.part1.workStatuses.workStatusType",
    "isometric.sheets.revisions.spools.joints.part1.pipeLength.part",
    "isometric.sheets.revisions.spools.joints.part1.pipeLength.material",
    "isometric.sheets.revisions.spools.joints.part1.pipeLength.diameter",
    "isometric.sheets.revisions.spools.joints.part1.pipeLength.part.workStatuses.workStatusType",
    "isometric.sheets.revisions.spools.joints.part1.fitting.part",
    "isometric.sheets.revisions.spools.joints.part1.fitting.material",
    "isometric.sheets.revisions.spools.joints.part1.fitting.fittingType",
    "isometric.sheets.revisions.spools.joints.part1.fitting.ports.diameter",
    "isometric.sheets.revisions.spools.joints.part1.fitting.part.workStatuses.workStatusType",
    "isometric.sheets.revisions.spools.joints.part2.workStatuses.workStatusType",
    "isometric.sheets.revisions.spools.joints.part2.pipeLength.part",
    "isometric.sheets.revisions.spools.joints.part2.pipeLength.material",
    "isometric.sheets.revisions.spools.joints.part2.pipeLength.diameter",
    "isometric.sheets.revisions.spools.joints.part2.pipeLength.part.workStatuses.workStatusType",
    "isometric.sheets.revisions.spools.joints.part2.fitting.part",
    "isometric.sheets.revisions.spools.joints.part2.fitting.material",
    "isometric.sheets.revisions.spools.joints.part2.fitting.fittingType",
    "isometric.sheets.revisions.spools.joints.part2.fitting.ports.diameter",
    "isometric.sheets.revisions.spools.joints.part2.fitting.part.workStatuses.workStatusType",
    "isometric.sheets.revisions.spools.joints.welds.workStatuses.workStatusType",
    "isometric.sheets.revisions.spools.joints.workStatuses.workStatusType",
  ] as const;

  private readonly MINIMAL_POPULATE_FIELDS = [
    "workStatuses.workStatusType",
    "isometric.sheets.revisions",
  ] as const;

  async findMinimalByJointIdOrFail(
    jointId: number,
  ): Promise<AssemblyListEntity> {
    return this.assemblyListRepository.findOneOrFail(
      {
        isometric: {
          sheets: {
            revisions: {
              spools: {
                joints: {
                  id: jointId,
                },
              },
            },
          },
        },
      },
      {
        populate: this.MINIMAL_POPULATE_FIELDS,
        orderBy: {
          id: QueryOrder.ASC,
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

  async findFullByIdOrFail(id: number): Promise<AssemblyListEntity> {
    return this.assemblyListRepository.findOneOrFail(id, {
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
                    workStatuses: { id: QueryOrder.ASC },
                  },
                  part2: {
                    id: QueryOrder.ASC,
                    workStatuses: { id: QueryOrder.ASC },
                  },
                  welds: {
                    id: QueryOrder.ASC,
                    workStatuses: { id: QueryOrder.ASC },
                  },
                  workStatuses: { id: QueryOrder.ASC },
                },
              },
            },
          },
        },
        workStatuses: { id: QueryOrder.ASC },
      },
      strategy: LoadStrategy.SELECT_IN,
    });
  }

  async findFullAll(): Promise<AssemblyListEntity[]> {
    return this.assemblyListRepository.findAll({
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
                    workStatuses: { id: QueryOrder.ASC },
                  },
                  part2: {
                    id: QueryOrder.ASC,
                    workStatuses: { id: QueryOrder.ASC },
                  },
                  welds: {
                    id: QueryOrder.ASC,
                    workStatuses: { id: QueryOrder.ASC },
                  },
                  workStatuses: { id: QueryOrder.ASC },
                },
              },
            },
          },
        },
        workStatuses: { id: QueryOrder.ASC },
      },
      strategy: LoadStrategy.SELECT_IN,
    });
  }

  async populateToFull(
    assemblyList: AssemblyListEntity,
  ): Promise<AssemblyListEntity> {
    const em = this.assemblyListRepository.getEntityManager();
    return em.populate(assemblyList, this.FULL_POPULATE_FIELDS, {
      strategy: LoadStrategy.SELECT_IN,
    });
  }

  async updateWorkStatusToWorking(
    assemblyList: AssemblyListEntity,
    userId: number,
  ): Promise<AssemblyListEntity> {
    return this.updateWorkStatus(assemblyList, userId, WorkStatusType.WORKING);
  }

  async updateWorkStatusToFinished(
    assemblyList: AssemblyListEntity,
    userId: number,
  ): Promise<AssemblyListEntity> {
    return this.updateWorkStatus(assemblyList, userId, WorkStatusType.FINISHED);
  }

  @Transactional()
  async updateWorkStatus(
    assemblyList: AssemblyListEntity,
    userId: number,
    workStatusType: string,
  ): Promise<AssemblyListEntity> {
    const em = this.assemblyListRepository.getEntityManager();
    const workStatusTypeEntity = await em.findOneOrFail(WorkStatusTypeEntity, {
      name: workStatusType,
    });

    const newWorkStatus = new AssemblyListWorkStatusEntity(
      assemblyList,
      workStatusTypeEntity,
      undefined,
      em.getReference(UserEntity, userId),
    );

    assemblyList.workStatuses.add(newWorkStatus);
    em.persist(newWorkStatus);
    em.persist(assemblyList);
    await em.flush();
    return assemblyList;
  }

  @Transactional()
  async create(
    isometricId: number,
    userId: number,
  ): Promise<AssemblyListEntity> {
    const em = this.assemblyListRepository.getEntityManager();

    const assemblyList = new AssemblyListEntity(
      "default",
      em.getReference(IsometricEntity, isometricId),
    );

    const workStatusType = await em.findOneOrFail(WorkStatusTypeEntity, {
      name: WorkStatusType.TO_DO,
    });

    const workStatus = new AssemblyListWorkStatusEntity(
      assemblyList,
      workStatusType,
      undefined,
      em.getReference(UserEntity, userId),
    );

    assemblyList.workStatuses.add(workStatus);
    em.persist(workStatus);
    em.persist(assemblyList);
    await em.flush();

    assemblyList.internalId = `AL${assemblyList.id.toString().padStart(4, "0")}`;
    em.persist(assemblyList);
    await em.flush();
    return assemblyList;
  }
}
