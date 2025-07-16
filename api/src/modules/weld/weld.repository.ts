import { WeldEntity } from "@modules/weld/entities";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import {
  EntityRepository,
  QueryOrder,
  Transactional,
} from "@mikro-orm/mariadb";
import { WorkStatusType, WorkStatusTypeEntity } from "@database/entities";
import { FillerMaterialEntity } from "@modules/filler-material/entities";
import { WpsEntity } from "@modules/wps/entities";
import { UserEntity } from "@modules/user/entities";
import { WeldWorkStatusEntity } from "@modules/weld/entities/weld-work-status.entity";

@Injectable()
export class WeldRepository {
  constructor(
    @InjectRepository(WeldEntity)
    private readonly weldRepository: EntityRepository<WeldEntity>,
  ) {}

  private readonly FULL_POPULATE_FIELDS = [
    "fillerMaterial",
    "wps",
    "workStatuses.workStatusType",
  ] as const;

  private readonly WORK_STATUS_TYPE_POPULATE_FIELDS = [
    "workStatuses.workStatusType",
  ] as const;

  async findById(id: number): Promise<WeldEntity | null> {
    return this.weldRepository.findOne(id);
  }

  async findByIdOrFail(id: number): Promise<WeldEntity> {
    return this.weldRepository.findOneOrFail(id);
  }

  async findAll(): Promise<WeldEntity[]> {
    return this.weldRepository.findAll();
  }

  async findFullById(id: number): Promise<WeldEntity | null> {
    return this.weldRepository.findOne(id, {
      populate: this.FULL_POPULATE_FIELDS,
      orderBy: {
        workStatuses: { id: QueryOrder.ASC },
      },
    });
  }

  async findFullByIdOrFail(id: number): Promise<WeldEntity> {
    return this.weldRepository.findOneOrFail(id, {
      populate: this.FULL_POPULATE_FIELDS,
      orderBy: {
        workStatuses: { id: QueryOrder.ASC },
      },
    });
  }

  async findFullAll(): Promise<WeldEntity[]> {
    return this.weldRepository.findAll({
      populate: this.FULL_POPULATE_FIELDS,
      orderBy: {
        id: "ASC",
        workStatuses: { id: QueryOrder.ASC },
      },
    });
  }

  async findWithWorkStatusesById(id: number): Promise<WeldEntity | null> {
    return this.weldRepository.findOne(id, {
      populate: this.WORK_STATUS_TYPE_POPULATE_FIELDS,
      orderBy: {
        workStatuses: { id: QueryOrder.ASC },
      },
    });
  }

  async findWithWorkStatusesByIdOrFail(id: number): Promise<WeldEntity> {
    return this.weldRepository.findOneOrFail(id, {
      populate: this.WORK_STATUS_TYPE_POPULATE_FIELDS,
      orderBy: {
        workStatuses: { id: QueryOrder.ASC },
      },
    });
  }

  async findWithWorkStatusesAll(): Promise<WeldEntity[]> {
    return this.weldRepository.findAll({
      populate: this.WORK_STATUS_TYPE_POPULATE_FIELDS,
      orderBy: {
        id: QueryOrder.ASC,
        workStatuses: { id: QueryOrder.ASC },
      },
    });
  }

  async populateToFull(weld: WeldEntity): Promise<WeldEntity> {
    const em = this.weldRepository.getEntityManager();
    return em.populate(weld, this.FULL_POPULATE_FIELDS, {
      orderBy: {
        workStatuses: { id: QueryOrder.ASC },
      },
    });
  }

  @Transactional()
  async updateWorkStatusToFinished(
    weld: WeldEntity,
    userId: number,
    fillerMaterial?: string,
    wps?: string,
    notes?: string,
  ): Promise<WeldEntity> {
    const em = this.weldRepository.getEntityManager();

    const [workingType, fillerMaterialEntity, wpsEntity] = await Promise.all([
      em.findOneOrFail(WorkStatusTypeEntity, {
        name: WorkStatusType.FINISHED,
      }),
      em.findOneOrFail(FillerMaterialEntity, {
        name: fillerMaterial,
      }),
      em.findOneOrFail(WpsEntity, { internalId: wps }),
    ]);

    const newWorkStatus = new WeldWorkStatusEntity(
      weld,
      workingType,
      notes,
      em.getReference(UserEntity, userId),
    );

    weld.workStatuses.add(newWorkStatus);
    weld.fillerMaterial = fillerMaterialEntity;
    weld.wps = wpsEntity;
    em.persist(newWorkStatus);
    em.persist(weld);
    await em.flush();
    return em.populate(weld, this.FULL_POPULATE_FIELDS);
  }

  @Transactional()
  async updateFillerMaterial(
    weld: WeldEntity,
    fillerMaterial?: string,
  ): Promise<WeldEntity> {
    const em = this.weldRepository.getEntityManager();

    weld.fillerMaterial = await em.findOneOrFail(FillerMaterialEntity, {
      name: fillerMaterial,
    });
    em.persist(weld);
    await em.flush();
    return em.populate(weld, this.FULL_POPULATE_FIELDS);
  }

  @Transactional()
  async updateWps(weld: WeldEntity, wps?: string): Promise<WeldEntity> {
    const em = this.weldRepository.getEntityManager();

    weld.wps = await em.findOneOrFail(WpsEntity, { internalId: wps });
    em.persist(weld);
    await em.flush();
    return em.populate(weld, this.FULL_POPULATE_FIELDS);
  }
}
