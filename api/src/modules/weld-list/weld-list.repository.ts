import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { WeldListEntity } from "@modules/weld-list/entities";
import {
  deriveListProgress,
  StatusCounts,
} from "@common/utils/list-progress.util";
import { ListProgress } from "@shared/types";

const ZERO: StatusCounts = { total: 0, done: 0, inProgress: 0 };

/** Acesso a dados das weld_lists (registrado na entidade via `repository`). */
export class WeldListRepository extends EntityRepository<WeldListEntity> {
  // Árvore do spool para a grelha de soldagem (detalhe sob demanda).
  private static readonly FULL_POPULATE = [
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

  private static readonly LIGHT_POPULATE = ["claimedBy", "spool"] as const;

  /** Lista leve das weld_lists com gating na consulta (montagem concluída). */
  async loadAllLight(): Promise<WeldListEntity[]> {
    const spoolIds = await this.getAssemblyCompleteSpoolIds();
    if (spoolIds.length === 0) return [];
    const lists = await this.find(
      { spool: { $in: spoolIds } },
      {
        populate: WeldListRepository.LIGHT_POPULATE,
        orderBy: { id: QueryOrder.ASC },
      },
    );
    const weldCounts = await this.getWeldCountsBySpool();
    for (const list of lists) {
      const w = weldCounts.get(list.spool.id) ?? ZERO;
      list.progress = deriveListProgress(w);
      list.available = true;
      list.weldCount = w.total;
    }
    return lists;
  }

  /** Detalhe (árvore completa) com progresso e total derivados. */
  async loadDetail(id: number): Promise<WeldListEntity> {
    const list = await this.findOneOrFail(
      { id },
      {
        populate: WeldListRepository.FULL_POPULATE,
        orderBy: {
          spool: { id: QueryOrder.ASC, joints: { id: QueryOrder.ASC } },
        },
      },
    );
    const spoolId = list.spool.id;
    const [weldCounts, jointCounts] = await Promise.all([
      this.getWeldCountsBySpool(),
      this.getJointCountsBySpool(),
    ]);
    const w = weldCounts.get(spoolId) ?? ZERO;
    list.progress = deriveListProgress(w);
    const j = jointCounts.get(spoolId) ?? ZERO;
    list.available = j.total > 0 && j.done === j.total;
    list.weldCount = w.total;
    return list;
  }

  async findByIdOrFail(id: number): Promise<WeldListEntity> {
    return this.findOneOrFail({ id }, { populate: ["claimedBy"] });
  }

  /** Localiza a weld_list cujo spool contém a solda dada. */
  async findByWeldIdOrFail(weldId: number): Promise<WeldListEntity> {
    return this.findOneOrFail(
      { spool: { joints: { welds: weldId } } },
      { populate: ["claimedBy"] },
    );
  }

  /** Progresso e gating derivados de um único spool (para o claim). */
  async deriveProgressBySpool(
    spoolId: number,
  ): Promise<{ progress: ListProgress; available: boolean }> {
    const [weldCounts, jointCounts] = await Promise.all([
      this.getWeldCountsBySpool(),
      this.getJointCountsBySpool(),
    ]);
    const progress = deriveListProgress(weldCounts.get(spoolId) ?? ZERO);
    const j = jointCounts.get(spoolId) ?? ZERO;
    const available = j.total > 0 && j.done === j.total;
    return { progress, available };
  }

  /** Conta as weld_lists pendentes: montagem concluída mas soldagem por terminar. */
  async countPending(): Promise<number> {
    const rows = await this.getEntityManager().execute<
      Array<{ pending: number }>
    >(
      `SELECT COUNT(*) AS pending FROM weld_list wl
       WHERE wl.spool_id IN (
         SELECT spool_id FROM joint
         GROUP BY spool_id
         HAVING COUNT(*) > 0
            AND COUNT(*) = SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END)
       )
       AND wl.spool_id NOT IN (
         SELECT j.spool_id FROM weld w
         JOIN joint j ON j.id = w.joint_id
         GROUP BY j.spool_id
         HAVING COUNT(w.id) > 0
            AND COUNT(w.id) = SUM(CASE WHEN w.status = 'done' THEN 1 ELSE 0 END)
       )`,
    );
    return Number(rows[0]?.pending ?? 0);
  }

  /**
   * Spools com a montagem concluída (todos os joints done) — o gating da
   * soldagem, resolvido numa única query no DB.
   */
  private async getAssemblyCompleteSpoolIds(): Promise<number[]> {
    const rows = await this.getEntityManager().execute<
      Array<{ spool: number }>
    >(
      `SELECT spool_id AS spool
       FROM joint
       GROUP BY spool_id
       HAVING COUNT(*) > 0
          AND COUNT(*) = SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END)`,
    );
    return rows.map((r) => Number(r.spool));
  }

  /** Contagem dos joints por spool (para o gating, em batch). */
  private async getJointCountsBySpool(): Promise<Map<number, StatusCounts>> {
    const rows = await this.getEntityManager().execute<
      Array<{ spool: number; total: number; done: number }>
    >(
      `SELECT spool_id AS spool,
              COUNT(*) AS total,
              SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) AS done
       FROM joint
       GROUP BY spool_id`,
    );
    return new Map(
      rows.map((r) => [
        Number(r.spool),
        { total: Number(r.total), done: Number(r.done), inProgress: 0 },
      ]),
    );
  }

  /** Contagem dos welds por spool (uma query agregada para todos). */
  private async getWeldCountsBySpool(): Promise<Map<number, StatusCounts>> {
    const rows = await this.getEntityManager().execute<
      Array<{ spool: number; total: number; done: number }>
    >(
      `SELECT j.spool_id AS spool,
              COUNT(w.id) AS total,
              SUM(CASE WHEN w.status = 'done' THEN 1 ELSE 0 END) AS done
       FROM weld w
       JOIN joint j ON j.id = w.joint_id
       GROUP BY j.spool_id`,
    );
    return new Map(
      rows.map((r) => [
        Number(r.spool),
        { total: Number(r.total), done: Number(r.done), inProgress: 0 },
      ]),
    );
  }
}
