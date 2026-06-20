import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { CutListEntity } from "@modules/cut-list/entities/cut-list.entity";
import { CutListRepository } from "@modules/cut-list/cut-list.repository";
import { UserEntity } from "@modules/user/entities/user.entity";
import { deriveListProgress } from "@common/utils/list-progress.util";
import { ClaimCutListCommand } from "@modules/cut-list/application/commands";

@CommandHandler(ClaimCutListCommand)
export class ClaimCutListHandler implements ICommandHandler<ClaimCutListCommand> {
  constructor(
    @InjectRepository(CutListEntity)
    private readonly repository: CutListRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ data }: ClaimCutListCommand): Promise<CutListEntity> {
    const list = await this.applyClaim(data.listId, data.userId);
    this.eventBus.publishAll(list.pullDomainEvents());
    return this.repository.loadDetail(data.listId);
  }

  @Transactional()
  private async applyClaim(
    listId: number,
    userId: number,
  ): Promise<CutListEntity> {
    const em = this.repository.getEntityManager();
    const list = await this.repository.findByIdOrFail(listId);
    const counts = await this.repository.deriveProgressByIsometric(
      list.isometric.id,
    );
    list.claimBy(em.getReference(UserEntity, userId), {
      available: true,
      progress: deriveListProgress(counts),
    });
    await em.flush();
    return list;
  }
}
