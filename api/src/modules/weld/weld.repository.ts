import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { WeldEntity } from "@modules/weld/entities/weld.entity";
import { WeldStatusEventEntity } from "@modules/weld/entities/weld-status-event.entity";

export class WeldRepository extends EntityRepository<WeldEntity> {
  private static readonly FULL_POPULATE = [
    "joint",
    "fillerMaterial",
    "wps",
  ] as const;

  async findByIdOrFail(id: number): Promise<WeldEntity> {
    return this.findOneOrFail({ id });
  }

  async loadDetail(id: number): Promise<WeldEntity> {
    return this.findOneOrFail(
      { id },
      { populate: WeldRepository.FULL_POPULATE },
    );
  }

  async findStatusEvents(id: number): Promise<WeldStatusEventEntity[]> {
    return this.getEntityManager().find(
      WeldStatusEventEntity,
      { weld: id },
      {
        populate: ["createdBy"],
        orderBy: { createdAt: QueryOrder.ASC, id: QueryOrder.ASC },
      },
    );
  }
}
