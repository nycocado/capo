import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { EntityRepository } from "@mikro-orm/mariadb";
import { QueryOrder } from "@mikro-orm/core";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { UserEntity } from "@modules/user/entities";
import { StatusCounts } from "@common/utils/list-progress.util";

@Injectable()
export class AssemblyListRepository {
  constructor(
    @InjectRepository(AssemblyListEntity)
    private readonly repository: EntityRepository<AssemblyListEntity>,
  ) {}

  // Árvore do isométrico para a grelha de montagem (detalhe sob demanda).
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
    "isometric.spools.joints.welds",
  ] as const;

  // Só os metadados da ordem (sem a árvore) para a listagem da tabela.
  private readonly LIGHT_POPULATE_FIELDS = ["claimedBy", "isometric"] as const;

  /** Lista leve das assembly_lists dos isométricos dados (gating na consulta). */
  async findLightByIsometricIds(
    isometricIds: number[],
  ): Promise<AssemblyListEntity[]> {
    if (isometricIds.length === 0) return [];
    return this.repository.find(
      { isometric: { $in: isometricIds } },
      {
        populate: this.LIGHT_POPULATE_FIELDS,
        orderBy: { id: QueryOrder.ASC },
      },
    );
  }

  async findFullByIdOrFail(id: number): Promise<AssemblyListEntity> {
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

  async findByIdOrFail(id: number): Promise<AssemblyListEntity> {
    return this.repository.findOneOrFail({ id }, { populate: ["claimedBy"] });
  }

  /** Localiza a assembly_list cujo isométrico contém a junta dada. */
  async findByJointIdOrFail(jointId: number): Promise<AssemblyListEntity> {
    return this.repository.findOneOrFail(
      { isometric: { spools: { joints: jointId } } },
      { populate: ["claimedBy"] },
    );
  }

  /**
   * Isométricos com o corte concluído (todos os pipe_lengths done) — o gating
   * da montagem, resolvido numa única query no DB.
   *
   * @returns Ids dos isométricos cut-complete
   */
  async getCutCompleteIsometricIds(): Promise<number[]> {
    const em = this.repository.getEntityManager();
    const rows = await em.execute<Array<{ iso: number }>>(
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
    const em = this.repository.getEntityManager();
    const rows = await em.execute<
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
  async getPipeLengthCountsByIsometric(): Promise<Map<number, StatusCounts>> {
    const em = this.repository.getEntityManager();
    const rows = await em.execute<
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
  async getSpoolCountsByIsometric(): Promise<Map<number, number>> {
    const em = this.repository.getEntityManager();
    const rows = await em.execute<Array<{ iso: number; total: number }>>(
      `SELECT isometric_id AS iso, COUNT(*) AS total
       FROM spool GROUP BY isometric_id`,
    );
    return new Map(rows.map((r) => [Number(r.iso), Number(r.total)]));
  }

  /** Total de welds por isométrico (uma query agregada para todos). */
  async getWeldCountsByIsometric(): Promise<Map<number, number>> {
    const em = this.repository.getEntityManager();
    const rows = await em.execute<Array<{ iso: number; total: number }>>(
      `SELECT s.isometric_id AS iso, COUNT(w.id) AS total
       FROM weld w
       JOIN joint j ON j.id = w.joint_id
       JOIN spool s ON s.id = j.spool_id
       GROUP BY s.isometric_id`,
    );
    return new Map(rows.map((r) => [Number(r.iso), Number(r.total)]));
  }

  /** Conta as assembly_lists pendentes: corte concluído mas montagem por terminar. */
  async getPendingCount(): Promise<number> {
    const em = this.repository.getEntityManager();
    const rows = await em.execute<Array<{ pending: number }>>(
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

  /** Define ou limpa o claim (userId null = release). */
  @Transactional()
  async updateClaim(
    assemblyList: AssemblyListEntity,
    userId: number | null,
  ): Promise<AssemblyListEntity> {
    const em = this.repository.getEntityManager();
    assemblyList.claimedBy = userId
      ? em.getReference(UserEntity, userId)
      : undefined;
    assemblyList.claimedAt = userId ? new Date() : undefined;
    await em.flush();
    return em.populate(assemblyList, ["claimedBy"]);
  }
}
