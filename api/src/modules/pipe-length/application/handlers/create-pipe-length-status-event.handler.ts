import { ConflictException } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Transactional } from "@mikro-orm/decorators/legacy";
import {
  PipeLengthEntity,
  PipeLengthStatus,
} from "@modules/pipe-length/entities/pipe-length.entity";
import { PipeLengthRepository } from "@modules/pipe-length/pipe-length.repository";
import { CutListEntity } from "@modules/cut-list/entities/cut-list.entity";
import { CutListRepository } from "@modules/cut-list/cut-list.repository";
import { UserEntity } from "@modules/user/entities/user.entity";
import { ClaimControlPolicy } from "@common/domain";
import {
  CreatePipeLengthStatusEventCommand,
  CreatePipeLengthStatusEventInput,
} from "@modules/pipe-length/application/commands";

@CommandHandler(CreatePipeLengthStatusEventCommand)
export class CreatePipeLengthStatusEventHandler implements ICommandHandler<CreatePipeLengthStatusEventCommand> {
  constructor(
    @InjectRepository(PipeLengthEntity)
    private readonly pipeLengths: PipeLengthRepository,
    @InjectRepository(CutListEntity)
    private readonly cutLists: CutListRepository,
    private readonly claimControl: ClaimControlPolicy,
    private readonly eventBus: EventBus,
  ) {}

  async execute({
    data,
  }: CreatePipeLengthStatusEventCommand): Promise<PipeLengthEntity> {
    const pipeLength = await this.apply(data);
    this.eventBus.publishAll(pipeLength.pullDomainEvents());
    return pipeLength;
  }

  @Transactional()
  private async apply(
    data: CreatePipeLengthStatusEventInput,
  ): Promise<PipeLengthEntity> {
    const em = this.pipeLengths.getEntityManager();
    const pipeLength = await this.pipeLengths.findByIdOrFail(data.id);

    // Lock: só o claimer da cut_list (ou admin) avança os itens.
    const cutList = await this.cutLists.findByPipeLengthIdOrFail(data.id);
    await this.claimControl.assertControls(cutList, data.userId);

    const by = em.getReference(UserEntity, data.userId);
    switch (data.status) {
      case PipeLengthStatus.IN_PROGRESS:
        pipeLength.startCutting(data.heatNumber, by, data.notes);
        break;
      case PipeLengthStatus.DONE:
        pipeLength.finishCutting(by, data.notes);
        break;
      default:
        throw new ConflictException(
          `Invalid status transition: ${pipeLength.status} -> ${data.status}`,
        );
    }

    await em.flush();
    return this.pipeLengths.loadDetail(data.id);
  }
}
