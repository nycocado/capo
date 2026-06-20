import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { CutListEntity } from "@modules/cut-list/entities";
import { CutListRepository } from "@modules/cut-list/cut-list.repository";
import { UserEntity } from "@modules/user/entities";
import { ReassignCutListCommand } from "@modules/cut-list/application/commands";

@CommandHandler(ReassignCutListCommand)
export class ReassignCutListHandler implements ICommandHandler<ReassignCutListCommand> {
  constructor(
    @InjectRepository(CutListEntity)
    private readonly repository: CutListRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ data }: ReassignCutListCommand): Promise<CutListEntity> {
    const list = await this.applyReassign(data.listId, data.targetUserId);
    this.eventBus.publishAll(list.pullDomainEvents());
    return this.repository.loadDetail(data.listId);
  }

  @Transactional()
  private async applyReassign(
    listId: number,
    targetUserId: number,
  ): Promise<CutListEntity> {
    const em = this.repository.getEntityManager();
    const list = await this.repository.findByIdOrFail(listId);
    list.reassignTo(em.getReference(UserEntity, targetUserId));
    await em.flush();
    return list;
  }
}
