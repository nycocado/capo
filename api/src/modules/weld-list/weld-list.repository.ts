import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { WeldListEntity } from "@modules/weld-list/entities";
import { UserEntity } from "@modules/user/entities";
import { StatusCounts } from "@common/utils/list-progress.util";

@Injectable()
export class WeldListRepository {
  constructor(
    @InjectRepository(WeldListEntity)
    private readonly repository: EntityRepository<WeldListEntity>,
  ) {}

  // Árvore do spool para a grelha de soldagem (detalhe sob demanda).
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

  // Só os metadados da ordem (sem a árvore) para a listagem da tabela.
  private readonly LIGHT_POPULATE_FIELDS = ["claimedBy", "spool"] as const;

  /** Lista leve das weld_lists dos spools dados (gating na consulta). */
  async findLightBySpoolIds(spoolIds: number[]): Promise<WeldListEntity[]> {
    if (spoolIds.length === 0) return [];
    return this.repository.find(
      { spool: { $in: spoolIds } },
      {
        populate: this.LIGHT_POPULATE_FIELDS,
        orderBy: { id: QueryOrder.ASC },
      },
    );
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

  /**
   * Spools com a montagem concluída (todos os joints done) — o gating da
   * soldagem, resolvido numa única query no DB.
   *
   * @returns Ids dos spools assembly-complete
   */
  async getAssemblyCompleteSpoolIds(): Promise<number[]> {
    const em = this.repository.getEntityManager();
    const rows = await em.execute<Array<{ spool: number }>>(
      `SELECT spool_id AS spool
       FROM joint
       GROUP BY spool_id
       HAVING COUNT(*) > 0
          AND COUNT(*) = SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END)`,
    );
    return rows.map((r) => Number(r.spool));
  }

  /** Contagem dos joints por spool (para o gating, em batch). */
  async getJointCountsBySpool(): Promise<Map<number, StatusCounts>> {
    const em = this.repository.getEntityManager();
    const rows = await em.execute<
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
  async getWeldCountsBySpool(): Promise<Map<number, StatusCounts>> {
    const em = this.repository.getEntityManager();
    const rows = await em.execute<
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

  /** Conta as weld_lists pendentes: montagem concluída mas soldagem por terminar. */
  async getPendingCount(): Promise<number> {
    const em = this.repository.getEntityManager();
    const rows = await em.execute<Array<{ pending: number }>>(
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
