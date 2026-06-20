import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { PipeLengthEntity } from "@modules/pipe-length/entities/pipe-length.entity";
import { PipeLengthStatusEventEntity } from "@modules/pipe-length/entities/pipe-length-status-event.entity";

export class PipeLengthRepository extends EntityRepository<PipeLengthEntity> {
  private static readonly FULL_POPULATE = [
    "part",
    "material",
    "diameter",
  ] as const;

  async findByIdOrFail(id: number): Promise<PipeLengthEntity> {
    return this.findOneOrFail({ part: id });
  }

  async loadDetail(id: number): Promise<PipeLengthEntity> {
    return this.findOneOrFail(
      { part: id },
      { populate: PipeLengthRepository.FULL_POPULATE },
    );
  }

  async findStatusEvents(id: number): Promise<PipeLengthStatusEventEntity[]> {
    return this.getEntityManager().find(
      PipeLengthStatusEventEntity,
      { pipeLength: { part: id } },
      {
        populate: ["createdBy"],
        orderBy: { createdAt: QueryOrder.ASC, id: QueryOrder.ASC },
      },
    );
  }
}
