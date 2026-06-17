import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { Transactional } from "@mikro-orm/decorators/legacy";
import {
  PipeLengthEntity,
  PipeLengthStatus,
  PipeLengthStatusEventEntity,
} from "@modules/pipe-length/entities";
import { UserEntity } from "@modules/user/entities";

@Injectable()
export class PipeLengthRepository {
  constructor(
    @InjectRepository(PipeLengthEntity)
    private readonly repository: EntityRepository<PipeLengthEntity>,
  ) {}

  private readonly FULL_POPULATE_FIELDS = [
    "part",
    "material",
    "diameter",
  ] as const;

  async findByIdOrFail(id: number): Promise<PipeLengthEntity> {
    return this.repository.findOneOrFail({ part: id });
  }

  async findFullByIdOrFail(id: number): Promise<PipeLengthEntity> {
    return this.repository.findOneOrFail(
      { part: id },
      { populate: this.FULL_POPULATE_FIELDS },
    );
  }

  async findStatusEvents(id: number): Promise<PipeLengthStatusEventEntity[]> {
    const em = this.repository.getEntityManager();
    return em.find(
      PipeLengthStatusEventEntity,
      { pipeLength: { part: id } },
      {
        populate: ["createdBy"],
        orderBy: { createdAt: QueryOrder.ASC, id: QueryOrder.ASC },
      },
    );
  }

  /** Atualiza o status atual e regista o evento na trilha, na mesma transação. */
  @Transactional()
  async applyStatusEvent(
    pipeLength: PipeLengthEntity,
    status: PipeLengthStatus,
    userId: number,
    heatNumber?: string,
    notes?: string,
  ): Promise<PipeLengthEntity> {
    const em = this.repository.getEntityManager();

    pipeLength.status = status;
    if (heatNumber !== undefined) {
      pipeLength.heatNumber = heatNumber;
    }

    const event = new PipeLengthStatusEventEntity();
    event.status = status;
    event.pipeLength = pipeLength;
    event.notes = notes;
    event.createdBy = em.getReference(UserEntity, userId);
    em.persist(event);

    await em.flush();
    return em.populate(pipeLength, this.FULL_POPULATE_FIELDS);
  }
}
