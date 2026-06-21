import { EntityRepository } from "@mikro-orm/mariadb";
import { LockMode, QueryOrder } from "@mikro-orm/core";
import { CutListEntity } from "@modules/cut-list/entities/cut-list.entity";
import {
  deriveListProgress,
  StatusCounts,
} from "@common/utils/list-progress.util";

export class CutListRepository extends EntityRepository<CutListEntity> {
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
    return this.findOneOrFail(
      { id },
      { populate: ["claimedBy"], lockMode: LockMode.PESSIMISTIC_WRITE },
    );
  }

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

  async deriveProgressByIsometric(isometricId: number): Promise<StatusCounts> {
    const counts = await this.getCountsByIsometric();
    return counts.get(isometricId) ?? { total: 0, done: 0, inProgress: 0 };
  }

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

  private attachDerived(list: CutListEntity, counts?: StatusCounts): void {
    const c = counts ?? { total: 0, done: 0, inProgress: 0 };
    list.progress = deriveListProgress(c);
    list.available = true;
    list.pipeCount = c.total;
  }
}
