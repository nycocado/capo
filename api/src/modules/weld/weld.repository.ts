import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { Transactional } from "@mikro-orm/decorators/legacy";
import {
  WeldEntity,
  WeldStatus,
  WeldStatusEventEntity,
} from "@modules/weld/entities";
import { UserEntity } from "@modules/user/entities";
import { FillerMaterialEntity } from "@modules/filler-material/entities";
import { WpsEntity } from "@modules/wps/entities";

@Injectable()
export class WeldRepository {
  constructor(
    @InjectRepository(WeldEntity)
    private readonly repository: EntityRepository<WeldEntity>,
  ) {}

  private readonly FULL_POPULATE_FIELDS = [
    "joint",
    "fillerMaterial",
    "wps",
  ] as const;

  async findByIdOrFail(id: number): Promise<WeldEntity> {
    return this.repository.findOneOrFail({ id });
  }

  async findFullByIdOrFail(id: number): Promise<WeldEntity> {
    return this.repository.findOneOrFail(
      { id },
      { populate: this.FULL_POPULATE_FIELDS },
    );
  }

  async findStatusEvents(id: number): Promise<WeldStatusEventEntity[]> {
    const em = this.repository.getEntityManager();
    return em.find(
      WeldStatusEventEntity,
      { weld: id },
      {
        populate: ["createdBy"],
        orderBy: { createdAt: QueryOrder.ASC, id: QueryOrder.ASC },
      },
    );
  }

  /** Aplica a transição de status e regista o evento na trilha, na mesma transação. */
  @Transactional()
  async applyStatusEvent(
    weld: WeldEntity,
    status: WeldStatus,
    userId: number,
    fillerMaterialId?: number,
    wpsId?: number,
    notes?: string,
  ): Promise<WeldEntity> {
    const em = this.repository.getEntityManager();

    weld.status = status;
    if (fillerMaterialId !== undefined) {
      weld.fillerMaterial = em.getReference(
        FillerMaterialEntity,
        fillerMaterialId,
      );
    }
    if (wpsId !== undefined) {
      weld.wps = em.getReference(WpsEntity, wpsId);
    }

    const event = new WeldStatusEventEntity();
    event.status = status;
    event.weld = weld;
    event.notes = notes;
    event.createdBy = em.getReference(UserEntity, userId);
    em.persist(event);

    await em.flush();
    return em.populate(weld, this.FULL_POPULATE_FIELDS);
  }
}
