import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { CutListRepository } from "@modules/cut-list/cut-list.repository";
import { CutListEntity } from "@modules/cut-list/entities";
import { UserRoleService } from "@modules/user-role";
import { ListProgress, Role } from "@shared/types";
import { deriveListProgress } from "@common/utils/list-progress.util";

@Injectable()
export class CutListService {
  constructor(
    private readonly cutListRepository: CutListRepository,
    private readonly userRoleService: UserRoleService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getAll(): Promise<CutListEntity[]> {
    const lists = await this.cutListRepository.findAllLight();
    for (const list of lists) {
      await this.attachDerived(list);
    }
    return lists;
  }

  async getById(id: number): Promise<CutListEntity> {
    const list = await this.cutListRepository.findFullByIdOrFail(id);
    await this.attachDerived(list);
    return list;
  }

  async claim(id: number, userId: number): Promise<CutListEntity> {
    const list = await this.cutListRepository.findByIdOrFail(id);
    const progress = await this.computeProgress(list);

    if (!this.computeAvailable()) {
      throw new ConflictException("Prior stage is not complete");
    }
    if (progress === ListProgress.DONE) {
      throw new ConflictException("Cannot claim a completed order");
    }
    if (list.claimedBy && list.claimedBy.id !== userId) {
      throw new ConflictException("Order already claimed by another user");
    }

    await this.cutListRepository.updateClaim(list, userId);
    this.eventEmitter.emit("cut-list.claimChanged", id, userId);
    return this.getById(id);
  }

  async release(id: number, userId: number): Promise<CutListEntity> {
    const list = await this.cutListRepository.findByIdOrFail(id);
    await this.assertClaimerOrAdmin(list, userId);

    await this.cutListRepository.updateClaim(list, null);
    this.eventEmitter.emit("cut-list.claimChanged", id, userId);
    return this.getById(id);
  }

  async reassign(id: number, targetUserId: number): Promise<CutListEntity> {
    const list = await this.cutListRepository.findByIdOrFail(id);
    await this.cutListRepository.updateClaim(list, targetUserId);
    this.eventEmitter.emit("cut-list.claimChanged", id, targetUserId);
    return this.getById(id);
  }

  /**
   * Garante que o utilizador pode avançar itens da ordem do pipe_length dado:
   * tem de ser o claimer ou um administrador.
   *
   * @throws ForbiddenException Se não for o claimer nem administrador
   */
  async assertCanAdvancePipeLength(
    pipeLengthId: number,
    userId: number,
  ): Promise<void> {
    const list =
      await this.cutListRepository.findByPipeLengthIdOrFail(pipeLengthId);
    await this.assertClaimerOrAdmin(list, userId);
  }

  private async assertClaimerOrAdmin(
    list: CutListEntity,
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

  private async computeProgress(list: CutListEntity): Promise<ListProgress> {
    const counts = await this.cutListRepository.getPipeLengthStatusCounts(
      list.isometric.id,
    );
    return deriveListProgress(counts);
  }

  /** Gating: cut é o 1º estágio, logo está sempre disponível. */
  private computeAvailable(): boolean {
    return true;
  }

  /** Preenche os campos derivados (progress/available). */
  private async attachDerived(list: CutListEntity): Promise<void> {
    list.progress = await this.computeProgress(list);
    list.available = this.computeAvailable();
  }
}
