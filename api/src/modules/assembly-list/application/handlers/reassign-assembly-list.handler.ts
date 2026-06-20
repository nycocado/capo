import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { AssemblyListRepository } from "@modules/assembly-list/assembly-list.repository";
import { UserEntity } from "@modules/user/entities";
import { ReassignAssemblyListCommand } from "@modules/assembly-list/application/commands";

@CommandHandler(ReassignAssemblyListCommand)
export class ReassignAssemblyListHandler implements ICommandHandler<ReassignAssemblyListCommand> {
  constructor(
    @InjectRepository(AssemblyListEntity)
    private readonly repository: AssemblyListRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    data,
  }: ReassignAssemblyListCommand): Promise<AssemblyListEntity> {
    const list = await this.applyReassign(data.listId, data.targetUserId);
    this.eventBus.publishAll(list.pullDomainEvents());
    return this.repository.loadDetail(data.listId);
  }

  @Transactional()
  private async applyReassign(
    listId: number,
    targetUserId: number,
  ): Promise<AssemblyListEntity> {
    const em = this.repository.getEntityManager();
    const list = await this.repository.findByIdOrFail(listId);
    list.reassignTo(em.getReference(UserEntity, targetUserId));
    await em.flush();
    return list;
  }
}
