import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { JointEntity } from "@modules/joint/entities/joint.entity";
import { JointRepository } from "@modules/joint/joint.repository";
import { AssemblyListEntity } from "@modules/assembly-list/entities/assembly-list.entity";
import { AssemblyListRepository } from "@modules/assembly-list/assembly-list.repository";
import { UserEntity } from "@modules/user/entities/user.entity";
import { ClaimControlPolicy } from "@common/domain";
import {
  CreateJointStatusEventCommand,
  CreateJointStatusEventInput,
} from "@modules/joint/application/commands";

@CommandHandler(CreateJointStatusEventCommand)
export class CreateJointStatusEventHandler implements ICommandHandler<CreateJointStatusEventCommand> {
  constructor(
    @InjectRepository(JointEntity)
    private readonly joints: JointRepository,
    @InjectRepository(AssemblyListEntity)
    private readonly assemblyLists: AssemblyListRepository,
    private readonly claimControl: ClaimControlPolicy,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ data }: CreateJointStatusEventCommand): Promise<JointEntity> {
    const joint = await this.apply(data);
    this.eventBus.publishAll(joint.pullDomainEvents());
    return joint;
  }

  @Transactional()
  private async apply(data: CreateJointStatusEventInput): Promise<JointEntity> {
    const em = this.joints.getEntityManager();
    const joint = await this.joints.findByIdOrFail(data.id);

    // Lock: só o claimer da assembly_list (ou admin) avança os itens.
    const assemblyList = await this.assemblyLists.findByJointIdOrFail(data.id);
    await this.claimControl.assertControls(assemblyList, data.userId);

    const by = em.getReference(UserEntity, data.userId);
    joint.complete(by, data.notes);

    await em.flush();
    return this.joints.loadDetail(data.id);
  }
}
