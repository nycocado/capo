import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { CutListEntity } from "@modules/cut-list/entities";
import {
  deriveListProgress,
  StatusCounts,
} from "@common/utils/list-progress.util";

/** Acesso a dados das cut_lists (registrado na entidade via `repository`). */
export class CutListRepository extends EntityRepository<CutListEntity> {
  // Árvore do isométrico para a grelha de corte (detalhe sob demanda).
  private static readonly FULL_POPULATE = [
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

  private static readonly LIGHT_POPULATE = ["claimedBy", "isometric"] as const;

  /** Lista leve de todas as cut_lists, com progresso e total derivados. */
  async loadAllLight(): Promise<CutListEntity[]> {
    const lists = await this.findAll({
      populate: CutListRepository.LIGHT_POPULATE,
      orderBy: { id: QueryOrder.ASC },
    });
    const counts = await this.getCountsByIsometric();
    for (const list of lists) {
      this.attachDerived(list, counts.get(list.isometric.id));
    }
    return lists;
  }

  /** Detalhe (árvore completa) com progresso e total derivados. */
  async loadDetail(id: number): Promise<CutListEntity> {
    const list = await this.findOneOrFail(
      { id },
      {
        populate: CutListRepository.FULL_POPULATE,
        orderBy: {
          isometric: {
            spools: { id: QueryOrder.ASC, joints: { id: QueryOrder.ASC } },
          },
        },
      },
    );
    const counts = await this.getCountsByIsometric();
    this.attachDerived(list, counts.get(list.isometric.id));
    return list;
  }

  async findByIdOrFail(id: number): Promise<CutListEntity> {
    return this.findOneOrFail({ id }, { populate: ["claimedBy"] });
  }

  /** Localiza a cut_list cujo isométrico contém o pipe_length dado. */
  async findByPipeLengthIdOrFail(pipeLengthId: number): Promise<CutListEntity> {
    return this.findOneOrFail(
      {
        isometric: {
          spools: {
            joints: { $or: [{ part1: pipeLengthId }, { part2: pipeLengthId }] },
          },
        },
      },
      { populate: ["claimedBy"] },
    );
  }

  /** Progresso derivado de um único isométrico (gating do claim). */
  async deriveProgressByIsometric(isometricId: number): Promise<StatusCounts> {
    const counts = await this.getCountsByIsometric();
    return counts.get(isometricId) ?? { total: 0, done: 0, inProgress: 0 };
  }

  /** Conta as cut_lists pendentes (isométrico ainda não totalmente cortado). */
  async countPending(): Promise<number> {
    const rows = await this.getEntityManager().execute<
      Array<{ pending: number }>
    >(
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

  /**
   * Contagem dos pipe_lengths por isométrico (uma query agregada, sem N+1). O
   * pipe_length é alvo de uma junta como part1 ou part2 (PK partilhada com part),
   * daí o OR no join e o DISTINCT (uma peça pode estar em várias juntas).
   */
  private async getCountsByIsometric(): Promise<Map<number, StatusCounts>> {
    const rows = await this.getEntityManager().execute<
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

  /** Cut é o 1º estágio: a ordem está sempre disponível (gating trivial). */
  private attachDerived(list: CutListEntity, counts?: StatusCounts): void {
    const c = counts ?? { total: 0, done: 0, inProgress: 0 };
    list.progress = deriveListProgress(c);
    list.available = true;
    list.pipeCount = c.total;
  }
}
