import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { WeldListEntity } from "@modules/weld-list/entities";
import { WeldListRepository } from "@modules/weld-list/weld-list.repository";
import { UserEntity } from "@modules/user/entities";
import { ReassignWeldListCommand } from "@modules/weld-list/application/commands";

@CommandHandler(ReassignWeldListCommand)
export class ReassignWeldListHandler implements ICommandHandler<ReassignWeldListCommand> {
  constructor(
    @InjectRepository(WeldListEntity)
    private readonly repository: WeldListRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ data }: ReassignWeldListCommand): Promise<WeldListEntity> {
    const list = await this.applyReassign(data.listId, data.targetUserId);
    this.eventBus.publishAll(list.pullDomainEvents());
    return this.repository.loadDetail(data.listId);
  }

  @Transactional()
  private async applyReassign(
    listId: number,
    targetUserId: number,
  ): Promise<WeldListEntity> {
    const em = this.repository.getEntityManager();
    const list = await this.repository.findByIdOrFail(listId);
    list.reassignTo(em.getReference(UserEntity, targetUserId));
    await em.flush();
    return list;
  }
}
