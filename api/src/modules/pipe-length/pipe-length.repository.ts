import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { PipeLengthEntity } from "@modules/pipe-length/entities";
import {
  EntityRepository,
  QueryOrder,
  Transactional,
} from "@mikro-orm/mariadb";
import {
  PartWorkStatusEntity,
  WorkStatusType,
  WorkStatusTypeEntity,
} from "@database/entities";
import { UserEntity } from "@modules/user/entities";

@Injectable()
export class PipeLengthRepository {
  constructor(
    @InjectRepository(PipeLengthEntity)
    private readonly pipeLengthRepository: EntityRepository<PipeLengthEntity>,
  ) {}

  private readonly FULL_POPULATE_FIELDS = [
    "part.workStatuses.workStatusType",
    "material",
    "diameter",
  ] as const;

  private readonly WORK_STATUS_POPULATE_FIELDS = [
    "part.workStatuses.workStatusType",
  ] as const;

  async findById(id: number): Promise<PipeLengthEntity | null> {
    return this.pipeLengthRepository.findOne({ part: { id: id } });
  }

  async findByIdOrFail(id: number): Promise<PipeLengthEntity> {
    return this.pipeLengthRepository.findOneOrFail({ part: { id: id } });
  }

  async findAll(): Promise<PipeLengthEntity[]> {
    return this.pipeLengthRepository.findAll();
  }

  async findFullById(id: number): Promise<PipeLengthEntity | null> {
    return this.pipeLengthRepository.findOne(
      { part: { id: id } },
      {
        populate: this.FULL_POPULATE_FIELDS,
        orderBy: {
          part: {
            workStatuses: { id: QueryOrder.ASC },
          },
        },
      },
    );
  }

  async findFullByIdOrFail(id: number): Promise<PipeLengthEntity> {
    return this.pipeLengthRepository.findOneOrFail(
      { part: { id: id } },
      {
        populate: this.FULL_POPULATE_FIELDS,
        orderBy: {
          part: {
            workStatuses: { id: QueryOrder.ASC },
          },
        },
      },
    );
  }

  async findFullAll(): Promise<PipeLengthEntity[]> {
    return this.pipeLengthRepository.findAll({
      populate: this.FULL_POPULATE_FIELDS,
      orderBy: {
        part: {
          id: QueryOrder.ASC,
          workStatuses: { id: QueryOrder.ASC },
        },
      },
    });
  }

  async findWithWorkStatusesById(id: number): Promise<PipeLengthEntity | null> {
    return this.pipeLengthRepository.findOne(
      { part: { id: id } },
      {
        populate: this.WORK_STATUS_POPULATE_FIELDS,
        orderBy: {
          part: {
            workStatuses: { id: QueryOrder.ASC },
          },
        },
      },
    );
  }

  async findWithWorkStatusesByIdOrFail(id: number): Promise<PipeLengthEntity> {
    return this.pipeLengthRepository.findOneOrFail(
      { part: { id: id } },
      {
        populate: this.WORK_STATUS_POPULATE_FIELDS,
        orderBy: {
          part: {
            workStatuses: { id: QueryOrder.ASC },
          },
        },
      },
    );
  }

  async findWithWorkStatusesAll(): Promise<PipeLengthEntity[]> {
    return this.pipeLengthRepository.findAll({
      populate: this.WORK_STATUS_POPULATE_FIELDS,
      orderBy: {
        part: {
          id: QueryOrder.ASC,
          workStatuses: { id: QueryOrder.ASC },
        },
      },
    });
  }

  async populateToFull(
    pipeLength: PipeLengthEntity,
  ): Promise<PipeLengthEntity> {
    return this.pipeLengthRepository
      .getEntityManager()
      .populate(pipeLength, this.FULL_POPULATE_FIELDS, {
        orderBy: {
          part: {
            workStatuses: { id: QueryOrder.ASC },
          },
        },
      });
  }

  @Transactional()
  async updateWorkStatusToWorking(
    pipeLength: PipeLengthEntity,
    userId: number,
    heatNumber?: string,
    notes?: string,
  ): Promise<PipeLengthEntity> {
    const em = this.pipeLengthRepository.getEntityManager();

    const workingType = await em.findOneOrFail(WorkStatusTypeEntity, {
      name: WorkStatusType.WORKING,
    });

    const newWorkStatus = new PartWorkStatusEntity(
      pipeLength.part,
      workingType,
      notes,
      em.getReference(UserEntity, userId),
    );

    pipeLength.part.workStatuses.add(newWorkStatus);
    pipeLength.heatNumber = heatNumber;
    em.persist(newWorkStatus);
    em.persist(pipeLength);
    await em.flush();
    return em.populate(pipeLength, this.FULL_POPULATE_FIELDS);
  }

  @Transactional()
  async updateWorkStatusToFinished(
    pipeLength: PipeLengthEntity,
    userId: number,
    notes?: string,
  ): Promise<PipeLengthEntity> {
    const em = this.pipeLengthRepository.getEntityManager();

    const finishedType = await em.findOneOrFail(WorkStatusTypeEntity, {
      name: WorkStatusType.FINISHED,
    });

    const newWorkStatus = new PartWorkStatusEntity(
      pipeLength.part,
      finishedType,
      notes,
      em.getReference(UserEntity, userId),
    );

    pipeLength.part.workStatuses.add(newWorkStatus);
    em.persist(newWorkStatus);
    em.persist(pipeLength);
    await em.flush();
    return em.populate(pipeLength, this.FULL_POPULATE_FIELDS);
  }

  @Transactional()
  async updateHeatNumber(
    pipeLength: PipeLengthEntity,
    heatNumber: string,
  ): Promise<PipeLengthEntity> {
    const em = this.pipeLengthRepository.getEntityManager();

    pipeLength.heatNumber = heatNumber;
    em.persist(pipeLength);
    await em.flush();
    return em.populate(pipeLength, this.FULL_POPULATE_FIELDS);
  }
}
