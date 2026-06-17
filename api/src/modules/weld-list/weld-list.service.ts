import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WeldListRepository } from "@modules/weld-list/weld-list.repository";
import { WeldListEntity } from "@modules/weld-list/entities";
import { UserRoleService } from "@modules/user-role";
import { ListProgress, Role } from "@shared/types";
import { deriveListProgress } from "@common/utils/list-progress.util";

@Injectable()
export class WeldListService {
  constructor(
    private readonly weldListRepository: WeldListRepository,
    private readonly userRoleService: UserRoleService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getAll(): Promise<WeldListEntity[]> {
    const lists = await this.weldListRepository.findAllLight();
    for (const list of lists) {
      await this.attachDerived(list);
    }
    return lists;
  }

  async getById(id: number): Promise<WeldListEntity> {
    const list = await this.weldListRepository.findFullByIdOrFail(id);
    await this.attachDerived(list);
    return list;
  }

  async claim(id: number, userId: number): Promise<WeldListEntity> {
    const list = await this.weldListRepository.findByIdOrFail(id);
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

    await this.weldListRepository.updateClaim(list, userId);
    this.eventEmitter.emit("weld-list.claimChanged", id, userId);
    return this.getById(id);
  }

  async release(id: number, userId: number): Promise<WeldListEntity> {
    const list = await this.weldListRepository.findByIdOrFail(id);
    await this.assertClaimerOrAdmin(list, userId);

    await this.weldListRepository.updateClaim(list, null);
    this.eventEmitter.emit("weld-list.claimChanged", id, userId);
    return this.getById(id);
  }

  async reassign(id: number, targetUserId: number): Promise<WeldListEntity> {
    const list = await this.weldListRepository.findByIdOrFail(id);
    await this.weldListRepository.updateClaim(list, targetUserId);
    this.eventEmitter.emit("weld-list.claimChanged", id, targetUserId);
    return this.getById(id);
  }

  /**
   * Garante que o utilizador pode avançar itens da ordem da solda dada:
   * tem de ser o claimer ou um administrador.
   *
   * @throws ForbiddenException Se não for o claimer nem administrador
   */
  async assertCanAdvanceWeld(weldId: number, userId: number): Promise<void> {
    const list = await this.weldListRepository.findByWeldIdOrFail(weldId);
    await this.assertClaimerOrAdmin(list, userId);
  }

  private async assertClaimerOrAdmin(
    list: WeldListEntity,
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

  private async computeProgress(list: WeldListEntity): Promise<ListProgress> {
    const counts = await this.weldListRepository.getWeldStatusCounts(
      list.spool.id,
    );
    return deriveListProgress(counts);
  }

  /** Gating: weld só está disponível quando a montagem do spool está concluída. */
  private async computeAvailable(list: WeldListEntity): Promise<boolean> {
    const c = await this.weldListRepository.getJointStatusCounts(list.spool.id);
    return c.total > 0 && c.done === c.total;
  }

  /** Preenche os campos derivados (progress/available). */
  private async attachDerived(list: WeldListEntity): Promise<void> {
    list.progress = await this.computeProgress(list);
    list.available = await this.computeAvailable(list);
  }
}
