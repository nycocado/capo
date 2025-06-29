import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { JointEntity } from '@modules/joint/entities';
import {
  EntityRepository,
  LoadStrategy,
  QueryOrder,
  Transactional,
} from '@mikro-orm/mariadb';
import { WorkStatusType, WorkStatusTypeEntity } from '@database/entities';
import { UserEntity } from '@modules/user/entities';
import { JointWorkStatusEntity } from '@modules/joint/entities/joint-work-status.entity';

@Injectable()
export class JointRepository {
  constructor(
    @InjectRepository(JointEntity)
    private readonly jointRepository: EntityRepository<JointEntity>,
  ) {}

  private readonly FULL_POPULATE_FIELDS = [
    'part1.workStatuses.workStatusType',
    'part1.pipeLength.material',
    'part1.pipeLength.diameter',
    'part1.pipeLength.part.workStatuses.workStatusType',
    'part1.fitting.material',
    'part1.fitting.fittingType',
    'part1.fitting.ports.diameter',
    'part1.fitting.part.workStatuses.workStatusType',
    'part2.workStatuses.workStatusType',
    'part2.pipeLength.material',
    'part2.pipeLength.diameter',
    'part2.pipeLength.part.workStatuses.workStatusType',
    'part2.fitting.material',
    'part2.fitting.fittingType',
    'part2.fitting.ports.diameter',
    'part2.fitting.part.workStatuses.workStatusType',
    'welds.fillerMaterial',
    'welds.wps',
    'welds.workStatuses.workStatusType',
    'workStatuses.workStatusType',
  ] as const;

  private readonly WORK_STATUS_POPULATE_FIELDS = [
    'workStatuses.workStatusType',
  ] as const;

  async findById(id: number): Promise<JointEntity | null> {
    return this.jointRepository.findOne(id);
  }

  async findByIdOrFail(id: number): Promise<JointEntity> {
    return this.jointRepository.findOneOrFail(id);
  }

  async findAll(): Promise<JointEntity[]> {
    return this.jointRepository.findAll();
  }

  async findFullById(id: number): Promise<JointEntity | null> {
    return this.jointRepository.findOne(
      { id: id },
      {
        populate: this.FULL_POPULATE_FIELDS,
        orderBy: {
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
        strategy: LoadStrategy.SELECT_IN,
      },
    );
  }

  async findFullByIdOrFail(id: number): Promise<JointEntity> {
    return this.jointRepository.findOneOrFail(
      { id: id },
      {
        populate: this.FULL_POPULATE_FIELDS,
        orderBy: {
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
        strategy: LoadStrategy.SELECT_IN,
      },
    );
  }

  async findFullAll(): Promise<JointEntity[]> {
    return this.jointRepository.findAll({
      populate: this.FULL_POPULATE_FIELDS,
      orderBy: {
        id: QueryOrder.ASC,
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
      strategy: LoadStrategy.SELECT_IN,
    });
  }

  async findWithWorkStatusesById(id: number): Promise<JointEntity | null> {
    return this.jointRepository.findOne(
      { id: id },
      {
        populate: this.WORK_STATUS_POPULATE_FIELDS,
        orderBy: {
          workStatuses: { id: QueryOrder.ASC },
        },
      },
    );
  }

  async findWithWorkStatusesByIdOrFail(id: number): Promise<JointEntity> {
    return this.jointRepository.findOneOrFail(
      { id: id },
      {
        populate: this.WORK_STATUS_POPULATE_FIELDS,
        orderBy: {
          workStatuses: { id: QueryOrder.ASC },
        },
      },
    );
  }

  async findWithWorkStatusesAll() {
    return this.jointRepository.findAll({
      populate: this.WORK_STATUS_POPULATE_FIELDS,
      orderBy: {
        workStatuses: { id: QueryOrder.ASC },
      },
    });
  }

  async populateToFull(joint: JointEntity): Promise<JointEntity> {
    return this.jointRepository
      .getEntityManager()
      .populate(joint, this.FULL_POPULATE_FIELDS, {
        orderBy: {
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
      });
  }

  @Transactional()
  async updateWorkStatusToFinished(
    joint: JointEntity,
    userId: number,
    notes?: string,
  ): Promise<JointEntity> {
    const em = this.jointRepository.getEntityManager();

    const workStatus = await em.findOneOrFail(WorkStatusTypeEntity, {
      name: WorkStatusType.FINISHED,
    });

    const newWorkStatus = new JointWorkStatusEntity(
      joint,
      workStatus,
      notes,
      em.getReference(UserEntity, userId),
    );

    joint.workStatuses.add(newWorkStatus);
    em.persist(newWorkStatus);
    em.persist(joint);
    await em.flush();
    return em.populate(joint, this.FULL_POPULATE_FIELDS);
  }
}
