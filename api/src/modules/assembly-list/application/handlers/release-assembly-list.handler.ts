import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { AssemblyListRepository } from "@modules/assembly-list/assembly-list.repository";
import { ClaimControlPolicy } from "@common/domain";
import { ReleaseAssemblyListCommand } from "@modules/assembly-list/application/commands";

@CommandHandler(ReleaseAssemblyListCommand)
export class ReleaseAssemblyListHandler implements ICommandHandler<ReleaseAssemblyListCommand> {
  constructor(
    @InjectRepository(AssemblyListEntity)
    private readonly repository: AssemblyListRepository,
    private readonly claimControl: ClaimControlPolicy,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    data,
  }: ReleaseAssemblyListCommand): Promise<AssemblyListEntity> {
    const list = await this.applyRelease(data.listId, data.userId);
    this.eventBus.publishAll(list.pullDomainEvents());
    return this.repository.loadDetail(data.listId);
  }

  @Transactional()
  private async applyRelease(
    listId: number,
    userId: number,
  ): Promise<AssemblyListEntity> {
    const list = await this.repository.findByIdOrFail(listId);
    await this.claimControl.assertControls(list, userId);
    list.release();
    await this.repository.getEntityManager().flush();
    return list;
  }
}
