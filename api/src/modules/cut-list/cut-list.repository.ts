import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { CutListEntity } from "@modules/cut-list/entities";
import { PipeLengthEntity, PipeLengthStatus } from "@modules/pipe-length/entities";
import { UserEntity } from "@modules/user/entities";

/** Contagem dos pipe_lengths de um isométrico por estado (para o progresso derivado). */
export interface PipeLengthStatusCounts {
  total: number;
  done: number;
  inProgress: number;
}

@Injectable()
export class CutListRepository {
  constructor(
    @InjectRepository(CutListEntity)
    private readonly repository: EntityRepository<CutListEntity>,
  ) {}

  // Árvore do isométrico para a grelha de corte (peças + juntas do isométrico).
  private readonly FULL_POPULATE_FIELDS = [
    "claimedBy",
    "isometric.spools.joints.part1.pipeLength.material",
    "isometric.spools.joints.part1.pipeLength.diameter",
    "isometric.spools.joints.part1.fitting.material",
    "isometric.spools.joints.part1.fitting.fittingType",
    "isometric.spools.joints.part1.fitting.ports.diameter",
    "isometric.spools.joints.part2.pipeLength.material",
    "isometric.spools.joints.part2.pipeLength.diameter",
    "isometric.spools.joints.part2.fitting.material",
    "isometric.spools.joints.part2.fitting.fittingType",
    "isometric.spools.joints.part2.fitting.ports.diameter",
  ] as const;

  private readonly LIGHT_POPULATE_FIELDS = ["claimedBy", "isometric"] as const;

  async findAllLight(): Promise<CutListEntity[]> {
    return this.repository.findAll({
      populate: this.LIGHT_POPULATE_FIELDS,
      orderBy: { id: QueryOrder.ASC },
    });
  }

  async findFullByIdOrFail(id: number): Promise<CutListEntity> {
    return this.repository.findOneOrFail(
      { id },
      {
        populate: this.FULL_POPULATE_FIELDS,
        orderBy: {
          isometric: {
            spools: { id: QueryOrder.ASC, joints: { id: QueryOrder.ASC } },
          },
        },
      },
    );
  }

  async findByIdOrFail(id: number): Promise<CutListEntity> {
    return this.repository.findOneOrFail(
      { id },
      { populate: ["claimedBy"] },
    );
  }

  /** Localiza a cut_list cujo isométrico contém o pipe_length dado (via junta/spool). */
  async findByPipeLengthIdOrFail(pipeLengthId: number): Promise<CutListEntity> {
    return this.repository.findOneOrFail(
      {
        isometric: {
          spools: {
            joints: {
              $or: [{ part1: pipeLengthId }, { part2: pipeLengthId }],
            },
          },
        },
      },
      { populate: ["claimedBy"] },
    );
  }

  /** Conta os pipe_lengths do isométrico por estado (distinct — uma peça pode estar em várias juntas). */
  async getPipeLengthStatusCounts(
    isometricId: number,
  ): Promise<PipeLengthStatusCounts> {
    const em = this.repository.getEntityManager();
    const base = {
      part: {
        $or: [
          { jointsAsPart1: { spool: { isometric: isometricId } } },
          { jointsAsPart2: { spool: { isometric: isometricId } } },
        ],
      },
    };

    const total = await em
      .createQueryBuilder(PipeLengthEntity, "pl")
      .where(base)
      .getCount();
    const done = await em
      .createQueryBuilder(PipeLengthEntity, "pl")
      .where({ ...base, status: PipeLengthStatus.DONE })
      .getCount();
    const inProgress = await em
      .createQueryBuilder(PipeLengthEntity, "pl")
      .where({ ...base, status: PipeLengthStatus.IN_PROGRESS })
      .getCount();

    return { total, done, inProgress };
  }

  /** Define ou limpa o claim (userId null = release). */
  @Transactional()
  async updateClaim(
    cutList: CutListEntity,
    userId: number | null,
  ): Promise<CutListEntity> {
    const em = this.repository.getEntityManager();
    cutList.claimedBy = userId ? em.getReference(UserEntity, userId) : undefined;
    cutList.claimedAt = userId ? new Date() : undefined;
    await em.flush();
    return em.populate(cutList, ["claimedBy"]);
  }
}
