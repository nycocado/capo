import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { WeldListEntity } from "@modules/weld-list/entities";
import { WeldListRepository } from "@modules/weld-list/weld-list.repository";
import { UserEntity } from "@modules/user/entities";
import { ClaimWeldListCommand } from "@modules/weld-list/application/commands";

@CommandHandler(ClaimWeldListCommand)
export class ClaimWeldListHandler implements ICommandHandler<ClaimWeldListCommand> {
  constructor(
    @InjectRepository(WeldListEntity)
    private readonly repository: WeldListRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ data }: ClaimWeldListCommand): Promise<WeldListEntity> {
    const list = await this.applyClaim(data.listId, data.userId);
    this.eventBus.publishAll(list.pullDomainEvents());
    return this.repository.loadDetail(data.listId);
  }

  @Transactional()
  private async applyClaim(
    listId: number,
    userId: number,
  ): Promise<WeldListEntity> {
    const em = this.repository.getEntityManager();
    const list = await this.repository.findByIdOrFail(listId);
    const ctx = await this.repository.deriveProgressBySpool(list.spool.id);
    list.claimBy(em.getReference(UserEntity, userId), ctx);
    await em.flush();
    return list;
  }
}
