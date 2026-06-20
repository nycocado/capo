import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { JointEntity } from "@modules/joint/entities/joint.entity";
import { JointStatusEventEntity } from "@modules/joint/entities/joint-status-event.entity";

/** Acesso a dados dos joints (registrado na entidade via `repository`). */
export class JointRepository extends EntityRepository<JointEntity> {
  private static readonly FULL_POPULATE = ["spool", "part1", "part2"] as const;

  async findByIdOrFail(id: number): Promise<JointEntity> {
    return this.findOneOrFail({ id });
  }

  /** Detalhe com spool/partes (para resposta HTTP e payload do socket). */
  async loadDetail(id: number): Promise<JointEntity> {
    return this.findOneOrFail(
      { id },
      { populate: JointRepository.FULL_POPULATE },
    );
  }

  async findStatusEvents(id: number): Promise<JointStatusEventEntity[]> {
    return this.getEntityManager().find(
      JointStatusEventEntity,
      { joint: id },
      {
        populate: ["createdBy"],
        orderBy: { createdAt: QueryOrder.ASC, id: QueryOrder.ASC },
      },
    );
  }
}
