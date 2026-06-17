import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { WeldListEntity } from "@modules/weld-list/entities";
import { JointEntity, JointStatus } from "@modules/joint/entities";
import { WeldEntity, WeldStatus } from "@modules/weld/entities";
import { UserEntity } from "@modules/user/entities";

/** Contagem dos welds de um spool por estado (para o progresso derivado). */
export interface WeldStatusCounts {
  total: number;
  done: number;
  inProgress: number;
}

/** Contagem dos joints de um spool por estado (para o gating). */
export interface JointStatusCounts {
  total: number;
  done: number;
  inProgress: number;
}

@Injectable()
export class WeldListRepository {
  constructor(
    @InjectRepository(WeldListEntity)
    private readonly repository: EntityRepository<WeldListEntity>,
  ) {}

  // Árvore do spool para a grelha de soldagem.
  private readonly FULL_POPULATE_FIELDS = [
    "claimedBy",
    "spool.joints.part1.pipeLength.material",
    "spool.joints.part1.pipeLength.diameter",
    "spool.joints.part1.fitting.material",
    "spool.joints.part1.fitting.fittingType",
    "spool.joints.part1.fitting.ports.diameter",
    "spool.joints.part2.pipeLength.material",
    "spool.joints.part2.pipeLength.diameter",
    "spool.joints.part2.fitting.material",
    "spool.joints.part2.fitting.fittingType",
    "spool.joints.part2.fitting.ports.diameter",
    "spool.joints.welds.fillerMaterial",
    "spool.joints.welds.wps",
  ] as const;

  private readonly LIGHT_POPULATE_FIELDS = ["claimedBy", "spool"] as const;

  async findAllLight(): Promise<WeldListEntity[]> {
    return this.repository.findAll({
      populate: this.LIGHT_POPULATE_FIELDS,
      orderBy: { id: QueryOrder.ASC },
    });
  }

  async findFullByIdOrFail(id: number): Promise<WeldListEntity> {
    return this.repository.findOneOrFail(
      { id },
      {
        populate: this.FULL_POPULATE_FIELDS,
        orderBy: {
          spool: { id: QueryOrder.ASC, joints: { id: QueryOrder.ASC } },
        },
      },
    );
  }

  async findByIdOrFail(id: number): Promise<WeldListEntity> {
    return this.repository.findOneOrFail({ id }, { populate: ["claimedBy"] });
  }

  /** Localiza a weld_list cujo spool contém a solda dada. */
  async findByWeldIdOrFail(weldId: number): Promise<WeldListEntity> {
    return this.repository.findOneOrFail(
      { spool: { joints: { welds: weldId } } },
      { populate: ["claimedBy"] },
    );
  }

  /** Conta os welds do spool por estado. */
  async getWeldStatusCounts(spoolId: number): Promise<WeldStatusCounts> {
    const em = this.repository.getEntityManager();
    const total = await em.count(WeldEntity, {
      joint: { spool: spoolId },
    });
    const done = await em.count(WeldEntity, {
      joint: { spool: spoolId },
      status: WeldStatus.DONE,
    });
    return { total, done, inProgress: 0 };
  }

  /** Conta os joints do spool por estado (para gating). */
  async getJointStatusCounts(spoolId: number): Promise<JointStatusCounts> {
    const em = this.repository.getEntityManager();
    const total = await em.count(JointEntity, { spool: spoolId });
    const done = await em.count(JointEntity, {
      spool: spoolId,
      status: JointStatus.DONE,
    });
    return { total, done, inProgress: 0 };
  }

  /** Define ou limpa o claim (userId null = release). */
  @Transactional()
  async updateClaim(
    weldList: WeldListEntity,
    userId: number | null,
  ): Promise<WeldListEntity> {
    const em = this.repository.getEntityManager();
    weldList.claimedBy = userId
      ? em.getReference(UserEntity, userId)
      : undefined;
    weldList.claimedAt = userId ? new Date() : undefined;
    await em.flush();
    return em.populate(weldList, ["claimedBy"]);
  }
}
