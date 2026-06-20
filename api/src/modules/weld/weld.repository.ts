import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { WeldEntity, WeldStatusEventEntity } from "@modules/weld/entities";

/** Acesso a dados das welds (registrado na entidade via `repository`). */
export class WeldRepository extends EntityRepository<WeldEntity> {
  private static readonly FULL_POPULATE = [
    "joint",
    "fillerMaterial",
    "wps",
  ] as const;

  async findByIdOrFail(id: number): Promise<WeldEntity> {
    return this.findOneOrFail({ id });
  }

  /** Detalhe com joint/filler/wps (para resposta HTTP e payload do socket). */
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
