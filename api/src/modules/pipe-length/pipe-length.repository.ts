import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import {
  PipeLengthEntity,
  PipeLengthStatusEventEntity,
} from "@modules/pipe-length/entities";

/** Acesso a dados dos pipe_lengths (registrado na entidade via `repository`). */
export class PipeLengthRepository extends EntityRepository<PipeLengthEntity> {
  private static readonly FULL_POPULATE = [
    "part",
    "material",
    "diameter",
  ] as const;

  /** O pipe_length partilha a PK com `part`, logo filtra-se por `{ part: id }`. */
  async findByIdOrFail(id: number): Promise<PipeLengthEntity> {
    return this.findOneOrFail({ part: id });
  }

  /** Detalhe com material/diâmetro (para resposta HTTP e payload do socket). */
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
