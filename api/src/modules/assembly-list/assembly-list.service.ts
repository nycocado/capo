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
import { deriveListProgress } from "@common/utils/list-progress.util";

@Injectable()
export class AssemblyListService {
  constructor(
    private readonly assemblyListRepository: AssemblyListRepository,
    private readonly userRoleService: UserRoleService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getAll(): Promise<AssemblyListEntity[]> {
    const lists = await this.assemblyListRepository.findAllLight();
    for (const list of lists) {
      await this.attachDerived(list);
    }
    return lists;
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
    const counts = await this.assemblyListRepository.getJointStatusCounts(
      list.isometric.id,
    );
    return deriveListProgress(counts);
  }

  /** Gating: assembly só está disponível quando o corte do isométrico está concluído. */
  private async computeAvailable(list: AssemblyListEntity): Promise<boolean> {
    const c = await this.assemblyListRepository.getPipeLengthStatusCounts(
      list.isometric.id,
    );
    return c.total > 0 && c.done === c.total;
  }

  /** Preenche os campos derivados (progress/available). */
  private async attachDerived(list: AssemblyListEntity): Promise<void> {
    list.progress = await this.computeProgress(list);
    list.available = await this.computeAvailable(list);
  }
}
