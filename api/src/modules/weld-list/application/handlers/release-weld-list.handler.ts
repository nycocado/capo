import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { WeldListEntity } from "@modules/weld-list/entities/weld-list.entity";
import { WeldListRepository } from "@modules/weld-list/weld-list.repository";
import { ClaimControlPolicy } from "@common/domain";
import { ReleaseWeldListCommand } from "@modules/weld-list/application/commands";

@CommandHandler(ReleaseWeldListCommand)
export class ReleaseWeldListHandler implements ICommandHandler<ReleaseWeldListCommand> {
  constructor(
    @InjectRepository(WeldListEntity)
    private readonly repository: WeldListRepository,
    private readonly claimControl: ClaimControlPolicy,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ data }: ReleaseWeldListCommand): Promise<WeldListEntity> {
    const list = await this.applyRelease(data.listId, data.userId);
    this.eventBus.publishAll(list.pullDomainEvents());
    return this.repository.loadDetail(data.listId);
  }

  @Transactional()
  private async applyRelease(
    listId: number,
    userId: number,
  ): Promise<WeldListEntity> {
    const list = await this.repository.findByIdOrFail(listId);
    await this.claimControl.assertControls(list, userId);
    list.release();
    await this.repository.getEntityManager().flush();
    return list;
  }
}
