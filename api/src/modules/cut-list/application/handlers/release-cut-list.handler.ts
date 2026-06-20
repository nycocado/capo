import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { CutListEntity } from "@modules/cut-list/entities";
import { CutListRepository } from "@modules/cut-list/cut-list.repository";
import { ClaimControlPolicy } from "@common/domain";
import { ReleaseCutListCommand } from "@modules/cut-list/application/commands";

@CommandHandler(ReleaseCutListCommand)
export class ReleaseCutListHandler implements ICommandHandler<ReleaseCutListCommand> {
  constructor(
    @InjectRepository(CutListEntity)
    private readonly repository: CutListRepository,
    private readonly claimControl: ClaimControlPolicy,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ data }: ReleaseCutListCommand): Promise<CutListEntity> {
    const list = await this.applyRelease(data.listId, data.userId);
    this.eventBus.publishAll(list.pullDomainEvents());
    return this.repository.loadDetail(data.listId);
  }

  @Transactional()
  private async applyRelease(
    listId: number,
    userId: number,
  ): Promise<CutListEntity> {
    const list = await this.repository.findByIdOrFail(listId);
    await this.claimControl.assertControls(list, userId);
    list.release();
    await this.repository.getEntityManager().flush();
    return list;
  }
}
