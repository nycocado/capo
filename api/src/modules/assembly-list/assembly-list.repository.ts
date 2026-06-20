import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { AssemblyListEntity } from "@modules/assembly-list/entities/assembly-list.entity";
import {
  deriveListProgress,
  StatusCounts,
} from "@common/utils/list-progress.util";
import { ListProgress } from "@shared/types";

const ZERO: StatusCounts = { total: 0, done: 0, inProgress: 0 };

/** Acesso a dados das assembly_lists (registrado na entidade via `repository`). */
export class AssemblyListRepository extends EntityRepository<AssemblyListEntity> {
  // Árvore do isométrico para a grelha de montagem (detalhe sob demanda).
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
    "isometric.spools.joints.welds",
  ] as const;

  private static readonly LIGHT_POPULATE = ["claimedBy", "isometric"] as const;

  /** Lista leve das assembly_lists com gating na consulta (corte concluído). */
  async loadAllLight(): Promise<AssemblyListEntity[]> {
    const isoIds = await this.getCutCompleteIsometricIds();
    if (isoIds.length === 0) return [];
    const lists = await this.find(
      { isometric: { $in: isoIds } },
      {
        populate: AssemblyListRepository.LIGHT_POPULATE,
        orderBy: { id: QueryOrder.ASC },
      },
    );
    const [jointCounts, spoolCounts, weldCounts] = await Promise.all([
      this.getJointCountsByIsometric(),
      this.getSpoolCountsByIsometric(),
      this.getWeldCountsByIsometric(),
    ]);
    for (const list of lists) {
      const isoId = list.isometric.id;
      list.progress = deriveListProgress(jointCounts.get(isoId) ?? ZERO);
      list.available = true;
      list.spoolCount = spoolCounts.get(isoId) ?? 0;
      list.weldCount = weldCounts.get(isoId) ?? 0;
    }
    return lists;
  }

  /** Detalhe (árvore completa) com progresso e contagens derivados. */
  async loadDetail(id: number): Promise<AssemblyListEntity> {
    const list = await this.findOneOrFail(
      { id },
      {
        populate: AssemblyListRepository.FULL_POPULATE,
        orderBy: {
          isometric: {
            spools: { id: QueryOrder.ASC, joints: { id: QueryOrder.ASC } },
          },
        },
      },
    );
    const isoId = list.isometric.id;
    const [jointCounts, plCounts, spoolCounts, weldCounts] = await Promise.all([
      this.getJointCountsByIsometric(),
      this.getPipeLengthCountsByIsometric(),
      this.getSpoolCountsByIsometric(),
      this.getWeldCountsByIsometric(),
    ]);
    list.progress = deriveListProgress(jointCounts.get(isoId) ?? ZERO);
    const pl = plCounts.get(isoId) ?? ZERO;
    list.available = pl.total > 0 && pl.done === pl.total;
    list.spoolCount = spoolCounts.get(isoId) ?? 0;
    list.weldCount = weldCounts.get(isoId) ?? 0;
    return list;
  }

  async findByIdOrFail(id: number): Promise<AssemblyListEntity> {
    return this.findOneOrFail({ id }, { populate: ["claimedBy"] });
  }

  /** Localiza a assembly_list cujo isométrico contém a junta dada. */
  async findByJointIdOrFail(jointId: number): Promise<AssemblyListEntity> {
    return this.findOneOrFail(
      { isometric: { spools: { joints: jointId } } },
      { populate: ["claimedBy"] },
    );
  }

  /** Progresso derivado de um único isométrico (gating do claim). */
  async deriveProgressByIsometric(
    isometricId: number,
  ): Promise<{ progress: ListProgress; available: boolean }> {
    const [jointCounts, plCounts] = await Promise.all([
      this.getJointCountsByIsometric(),
      this.getPipeLengthCountsByIsometric(),
    ]);
    const progress = deriveListProgress(jointCounts.get(isometricId) ?? ZERO);
    const pl = plCounts.get(isometricId) ?? ZERO;
    const available = pl.total > 0 && pl.done === pl.total;
    return { progress, available };
  }

  /** Conta as assembly_lists pendentes: corte concluído mas montagem por terminar. */
  async countPending(): Promise<number> {
    const rows = await this.getEntityManager().execute<
      Array<{ pending: number }>
    >(
      `SELECT COUNT(*) AS pending FROM assembly_list al
       WHERE al.isometric_id IN (
         SELECT s.isometric_id
         FROM pipe_length pl
         JOIN joint j ON j.part1_id = pl.id OR j.part2_id = pl.id
         JOIN spool s ON s.id = j.spool_id
         GROUP BY s.isometric_id
         HAVING COUNT(DISTINCT pl.id) > 0
            AND COUNT(DISTINCT pl.id) = COUNT(DISTINCT CASE WHEN pl.status = 'done' THEN pl.id END)
       )
       AND al.isometric_id NOT IN (
         SELECT s.isometric_id
         FROM joint j
         JOIN spool s ON s.id = j.spool_id
         GROUP BY s.isometric_id
         HAVING COUNT(*) > 0
            AND COUNT(*) = SUM(CASE WHEN j.status = 'done' THEN 1 ELSE 0 END)
       )`,
    );
    return Number(rows[0]?.pending ?? 0);
  }

  /**
   * Isométricos com o corte concluído (todos os pipe_lengths done) — o gating
   * da montagem, resolvido numa única query no DB.
   */
  private async getCutCompleteIsometricIds(): Promise<number[]> {
    const rows = await this.getEntityManager().execute<Array<{ iso: number }>>(
      `SELECT s.isometric_id AS iso
       FROM pipe_length pl
       JOIN joint j ON j.part1_id = pl.id OR j.part2_id = pl.id
       JOIN spool s ON s.id = j.spool_id
       GROUP BY s.isometric_id
       HAVING COUNT(DISTINCT pl.id) > 0
          AND COUNT(DISTINCT pl.id) = COUNT(DISTINCT CASE WHEN pl.status = 'done' THEN pl.id END)`,
    );
    return rows.map((r) => Number(r.iso));
  }

  /** Contagem dos joints por isométrico (uma query agregada para todos). */
  async getJointCountsByIsometric(): Promise<Map<number, StatusCounts>> {
    const rows = await this.getEntityManager().execute<
      Array<{ iso: number; total: number; done: number }>
    >(
      `SELECT s.isometric_id AS iso,
              COUNT(*) AS total,
              SUM(CASE WHEN j.status = 'done' THEN 1 ELSE 0 END) AS done
       FROM joint j
       JOIN spool s ON s.id = j.spool_id
       GROUP BY s.isometric_id`,
    );
    return new Map(
      rows.map((r) => [
        Number(r.iso),
        { total: Number(r.total), done: Number(r.done), inProgress: 0 },
      ]),
    );
  }

  /** Contagem dos pipe_lengths por isométrico (para o gating, em batch). */
  private async getPipeLengthCountsByIsometric(): Promise<
    Map<number, StatusCounts>
  > {
    const rows = await this.getEntityManager().execute<
      Array<{ iso: number; total: number; done: number }>
    >(
      `SELECT s.isometric_id AS iso,
              COUNT(DISTINCT pl.id) AS total,
              COUNT(DISTINCT CASE WHEN pl.status = 'done' THEN pl.id END) AS done
       FROM pipe_length pl
       JOIN joint j ON j.part1_id = pl.id OR j.part2_id = pl.id
       JOIN spool s ON s.id = j.spool_id
       GROUP BY s.isometric_id`,
    );
    return new Map(
      rows.map((r) => [
        Number(r.iso),
        { total: Number(r.total), done: Number(r.done), inProgress: 0 },
      ]),
    );
  }

  /** Total de spools por isométrico (uma query agregada para todos). */
  private async getSpoolCountsByIsometric(): Promise<Map<number, number>> {
    const rows = await this.getEntityManager().execute<
      Array<{ iso: number; total: number }>
    >(
      `SELECT isometric_id AS iso, COUNT(*) AS total FROM spool GROUP BY isometric_id`,
    );
    return new Map(rows.map((r) => [Number(r.iso), Number(r.total)]));
  }

  /** Total de welds por isométrico (uma query agregada para todos). */
  private async getWeldCountsByIsometric(): Promise<Map<number, number>> {
    const rows = await this.getEntityManager().execute<
      Array<{ iso: number; total: number }>
    >(
      `SELECT s.isometric_id AS iso, COUNT(w.id) AS total
       FROM weld w
       JOIN joint j ON j.id = w.joint_id
       JOIN spool s ON s.id = j.spool_id
       GROUP BY s.isometric_id`,
    );
    return new Map(rows.map((r) => [Number(r.iso), Number(r.total)]));
  }
}
