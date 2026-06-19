import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { CutListEntity } from "@modules/cut-list/entities";
import { UserEntity } from "@modules/user/entities";
import { StatusCounts } from "@common/utils/list-progress.util";

@Injectable()
export class CutListRepository {
  constructor(
    @InjectRepository(CutListEntity)
    private readonly repository: EntityRepository<CutListEntity>,
  ) {}

  // Árvore do isométrico para a grelha de corte (detalhe sob demanda).
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

  // Só os metadados da ordem (sem a árvore) para a listagem da tabela.
  private readonly LIGHT_POPULATE_FIELDS = ["claimedBy", "isometric"] as const;

  /** Lista leve de todas as cut_lists (cut é o 1º estágio: todas disponíveis). */
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
    return this.repository.findOneOrFail({ id }, { populate: ["claimedBy"] });
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

  /**
   * Contagem dos pipe_lengths por isométrico (uma query agregada para todos),
   * para preencher progresso e total na listagem sem N+1. O pipe_length é alvo
   * de uma junta como part1 ou part2 (PK partilhada com part), daí o OR no join
   * e o DISTINCT (uma peça pode aparecer em várias juntas).
   *
   * @returns Mapa isometricId → contagens dos pipe_lengths
   */
  async getPipeLengthCountsByIsometric(): Promise<Map<number, StatusCounts>> {
    const em = this.repository.getEntityManager();
    const rows = await em.execute<
      Array<{ iso: number; total: number; done: number; in_progress: number }>
    >(
      `SELECT s.isometric_id AS iso,
              COUNT(DISTINCT pl.id) AS total,
              COUNT(DISTINCT CASE WHEN pl.status = 'done' THEN pl.id END) AS done,
              COUNT(DISTINCT CASE WHEN pl.status = 'in_progress' THEN pl.id END) AS in_progress
       FROM pipe_length pl
       JOIN joint j ON j.part1_id = pl.id OR j.part2_id = pl.id
       JOIN spool s ON s.id = j.spool_id
       GROUP BY s.isometric_id`,
    );
    return new Map(
      rows.map((r) => [
        Number(r.iso),
        {
          total: Number(r.total),
          done: Number(r.done),
          inProgress: Number(r.in_progress),
        },
      ]),
    );
  }

  /** Contagem dos pipe_lengths de um único isométrico (para o detalhe/claim). */
  async getPipeLengthStatusCounts(isometricId: number): Promise<StatusCounts> {
    const counts = await this.getPipeLengthCountsByIsometric();
    return counts.get(isometricId) ?? { total: 0, done: 0, inProgress: 0 };
  }

  /** Conta as cut_lists pendentes (isométrico ainda não totalmente cortado). */
  async getPendingCount(): Promise<number> {
    const em = this.repository.getEntityManager();
    const rows = await em.execute<Array<{ pending: number }>>(
      `SELECT COUNT(*) AS pending FROM cut_list cl
       WHERE cl.isometric_id NOT IN (
         SELECT s.isometric_id
         FROM pipe_length pl
         JOIN joint j ON j.part1_id = pl.id OR j.part2_id = pl.id
         JOIN spool s ON s.id = j.spool_id
         GROUP BY s.isometric_id
         HAVING COUNT(DISTINCT pl.id) > 0
            AND COUNT(DISTINCT pl.id) = COUNT(DISTINCT CASE WHEN pl.status = 'done' THEN pl.id END)
       )`,
    );
    return Number(rows[0]?.pending ?? 0);
  }

  /** Define ou limpa o claim (userId null = release). */
  @Transactional()
  async updateClaim(
    cutList: CutListEntity,
    userId: number | null,
  ): Promise<CutListEntity> {
    const em = this.repository.getEntityManager();
    cutList.claimedBy = userId
      ? em.getReference(UserEntity, userId)
      : undefined;
    cutList.claimedAt = userId ? new Date() : undefined;
    await em.flush();
    return em.populate(cutList, ["claimedBy"]);
  }
}
