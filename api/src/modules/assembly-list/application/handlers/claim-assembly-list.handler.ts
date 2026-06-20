import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { AssemblyListEntity } from "@modules/assembly-list/entities";
import { AssemblyListRepository } from "@modules/assembly-list/assembly-list.repository";
import { UserEntity } from "@modules/user/entities";
import { ClaimAssemblyListCommand } from "@modules/assembly-list/application/commands";

@CommandHandler(ClaimAssemblyListCommand)
export class ClaimAssemblyListHandler implements ICommandHandler<ClaimAssemblyListCommand> {
  constructor(
    @InjectRepository(AssemblyListEntity)
    private readonly repository: AssemblyListRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    data,
  }: ClaimAssemblyListCommand): Promise<AssemblyListEntity> {
    const list = await this.applyClaim(data.listId, data.userId);
    this.eventBus.publishAll(list.pullDomainEvents());
    return this.repository.loadDetail(data.listId);
  }

  @Transactional()
  private async applyClaim(
    listId: number,
    userId: number,
  ): Promise<AssemblyListEntity> {
    const em = this.repository.getEntityManager();
    const list = await this.repository.findByIdOrFail(listId);
    const ctx = await this.repository.deriveProgressByIsometric(
      list.isometric.id,
    );
    list.claimBy(em.getReference(UserEntity, userId), ctx);
    await em.flush();
    return list;
  }
}
