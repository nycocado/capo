import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { Transactional } from "@mikro-orm/decorators/legacy";
import {
  JointEntity,
  JointStatus,
  JointStatusEventEntity,
} from "@modules/joint/entities";
import { UserEntity } from "@modules/user/entities";

@Injectable()
export class JointRepository {
  constructor(
    @InjectRepository(JointEntity)
    private readonly repository: EntityRepository<JointEntity>,
  ) {}

  private readonly FULL_POPULATE_FIELDS = ["spool", "part1", "part2"] as const;

  async findByIdOrFail(id: number): Promise<JointEntity> {
    return this.repository.findOneOrFail({ id });
  }

  async findFullByIdOrFail(id: number): Promise<JointEntity> {
    return this.repository.findOneOrFail(
      { id },
      { populate: this.FULL_POPULATE_FIELDS },
    );
  }

  async findStatusEvents(id: number): Promise<JointStatusEventEntity[]> {
    const em = this.repository.getEntityManager();
    return em.find(
      JointStatusEventEntity,
      { joint: id },
      {
        populate: ["createdBy"],
        orderBy: { createdAt: QueryOrder.ASC, id: QueryOrder.ASC },
      },
    );
  }

  /** Aplica a transição de status e regista o evento na trilha, na mesma transação. */
  @Transactional()
  async applyStatusEvent(
    joint: JointEntity,
    status: JointStatus,
    userId: number,
    notes?: string,
  ): Promise<JointEntity> {
    const em = this.repository.getEntityManager();

    joint.status = status;

    const event = new JointStatusEventEntity();
    event.status = status;
    event.joint = joint;
    event.notes = notes;
    event.createdBy = em.getReference(UserEntity, userId);
    em.persist(event);

    await em.flush();
    return em.populate(joint, this.FULL_POPULATE_FIELDS);
  }
}
