import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { AssemblyListRepository } from "@modules/assembly-list/assembly-list.repository";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { UserRoleService } from "@modules/user-role";
import { ListProgress, Role } from "@shared/types";
import {
  deriveListProgress,
  StatusCounts,
} from "@common/utils/list-progress.util";

const ZERO_COUNTS: StatusCounts = { total: 0, done: 0, inProgress: 0 };

@Injectable()
export class AssemblyListService {
  constructor(
    private readonly assemblyListRepository: AssemblyListRepository,
    private readonly userRoleService: UserRoleService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Lista leve das assembly_lists disponíveis (corte do isométrico concluído),
   * com progresso e contagens derivados. O gating é resolvido na consulta — só
   * os isométricos cut-complete são buscados.
   */
  async getAll(): Promise<AssemblyListEntity[]> {
    const isoIds =
      await this.assemblyListRepository.getCutCompleteIsometricIds();
    const lists =
      await this.assemblyListRepository.findLightByIsometricIds(isoIds);
    const [jointCounts, spoolCounts, weldCounts] = await Promise.all([
      this.assemblyListRepository.getJointCountsByIsometric(),
      this.assemblyListRepository.getSpoolCountsByIsometric(),
      this.assemblyListRepository.getWeldCountsByIsometric(),
    ]);
    for (const list of lists) {
      const isoId = list.isometric.id;
      list.progress = deriveListProgress(jointCounts.get(isoId) ?? ZERO_COUNTS);
      list.available = true;
      list.spoolCount = spoolCounts.get(isoId) ?? 0;
      list.weldCount = weldCounts.get(isoId) ?? 0;
    }
    return lists;
  }

  /** Nº de assembly_lists pendentes (para o resumo de estações), via COUNT no DB. */
  async getPendingCount(): Promise<number> {
    return this.assemblyListRepository.getPendingCount();
  }

  async getById(id: number): Promise<AssemblyListEntity> {
    const list = await this.assemblyListRepository.findFullByIdOrFail(id);
    await this.attachDerived(list);
    return list;
  }

  async claim(id: number, userId: number): Promise<AssemblyListEntity> {
    const list = await this.assemblyListRepository.findByIdOrFail(id);
    const progress = await this.computeProgress(list);

    if (!(await this.computeAvailable(list))) {
      throw new ConflictException("Prior stage is not complete");
    }
    if (progress === ListProgress.DONE) {
      throw new ConflictException("Cannot claim a completed order");
    }
    if (list.claimedBy && list.claimedBy.id !== userId) {
      throw new ConflictException("Order already claimed by another user");
    }

    await this.assemblyListRepository.updateClaim(list, userId);
    this.eventEmitter.emit("assembly-list.claimChanged", id, userId);
    return this.getById(id);
  }

  async release(id: number, userId: number): Promise<AssemblyListEntity> {
    const list = await this.assemblyListRepository.findByIdOrFail(id);
    await this.assertClaimerOrAdmin(list, userId);

    await this.assemblyListRepository.updateClaim(list, null);
    this.eventEmitter.emit("assembly-list.claimChanged", id, userId);
    return this.getById(id);
  }

  async reassign(
    id: number,
    targetUserId: number,
  ): Promise<AssemblyListEntity> {
    const list = await this.assemblyListRepository.findByIdOrFail(id);
    await this.assemblyListRepository.updateClaim(list, targetUserId);
    this.eventEmitter.emit("assembly-list.claimChanged", id, targetUserId);
    return this.getById(id);
  }

  /**
   * Garante que o utilizador pode avançar itens da ordem da junta dada:
   * tem de ser o claimer ou um administrador.
   *
   * @throws ForbiddenException Se não for o claimer nem administrador
   */
  async assertCanAdvanceJoint(jointId: number, userId: number): Promise<void> {
    const list = await this.assemblyListRepository.findByJointIdOrFail(jointId);
    await this.assertClaimerOrAdmin(list, userId);
  }

  private async assertClaimerOrAdmin(
    list: AssemblyListEntity,
    userId: number,
  ): Promise<void> {
    if (list.claimedBy?.id === userId) {
      return;
    }
    if (await this.userRoleService.hasRole(userId, Role.ADMINISTRATOR)) {
      return;
    }
    throw new ForbiddenException("Order is not claimed by this user");
  }

  private async computeProgress(
    list: AssemblyListEntity,
  ): Promise<ListProgress> {
    const counts =
      await this.assemblyListRepository.getJointCountsByIsometric();
    return deriveListProgress(counts.get(list.isometric.id) ?? ZERO_COUNTS);
  }

  /** Gating: assembly só está disponível quando o corte do isométrico está concluído. */
  private async computeAvailable(list: AssemblyListEntity): Promise<boolean> {
    const counts =
      await this.assemblyListRepository.getPipeLengthCountsByIsometric();
    const c = counts.get(list.isometric.id) ?? ZERO_COUNTS;
    return c.total > 0 && c.done === c.total;
  }

  /** Preenche os campos derivados (progress/available/spoolCount/weldCount). */
  private async attachDerived(list: AssemblyListEntity): Promise<void> {
    const isoId = list.isometric.id;
    const [jointCounts, plCounts, spoolCounts, weldCounts] = await Promise.all([
      this.assemblyListRepository.getJointCountsByIsometric(),
      this.assemblyListRepository.getPipeLengthCountsByIsometric(),
      this.assemblyListRepository.getSpoolCountsByIsometric(),
      this.assemblyListRepository.getWeldCountsByIsometric(),
    ]);
    list.progress = deriveListProgress(jointCounts.get(isoId) ?? ZERO_COUNTS);
    const pl = plCounts.get(isoId) ?? ZERO_COUNTS;
    list.available = pl.total > 0 && pl.done === pl.total;
    list.spoolCount = spoolCounts.get(isoId) ?? 0;
    list.weldCount = weldCounts.get(isoId) ?? 0;
  }
}
