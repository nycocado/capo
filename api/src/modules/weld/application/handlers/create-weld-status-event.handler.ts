import { ConflictException } from "@nestjs/common";
import { CommandHandler, EventBus, ICommandHandler } from "@nestjs/cqrs";
import { InjectRepository } from "@mikro-orm/nestjs";
import { Transactional } from "@mikro-orm/decorators/legacy";
import { WeldEntity, WeldStatus } from "@modules/weld/entities/weld.entity";
import { WeldRepository } from "@modules/weld/weld.repository";
import { WeldListEntity } from "@modules/weld-list/entities/weld-list.entity";
import { WeldListRepository } from "@modules/weld-list/weld-list.repository";
import { UserEntity } from "@modules/user/entities/user.entity";
import { FillerMaterialEntity } from "@modules/filler-material/entities/filler-material.entity";
import { WpsEntity } from "@modules/wps/entities/wps.entity";
import { ClaimControlPolicy } from "@common/domain";
import { withDeadlockRetry } from "@common/utils/deadlock-retry";
import {
  CreateWeldStatusEventCommand,
  CreateWeldStatusEventInput,
} from "@modules/weld/application/commands";

@CommandHandler(CreateWeldStatusEventCommand)
export class CreateWeldStatusEventHandler implements ICommandHandler<CreateWeldStatusEventCommand> {
  constructor(
    @InjectRepository(WeldEntity)
    private readonly welds: WeldRepository,
    @InjectRepository(WeldListEntity)
    private readonly weldLists: WeldListRepository,
    private readonly claimControl: ClaimControlPolicy,
    private readonly eventBus: EventBus,
  ) {}

  async execute({ data }: CreateWeldStatusEventCommand): Promise<WeldEntity> {
    const weld = await withDeadlockRetry(() => this.apply(data));
    this.eventBus.publishAll(weld.pullDomainEvents());
    return weld;
  }

  @Transactional()
  private async apply(data: CreateWeldStatusEventInput): Promise<WeldEntity> {
    const em = this.welds.getEntityManager();
    const weld = await this.welds.findByIdOrFail(data.id);

    const weldList = await this.weldLists.findByWeldIdOrFail(data.id);
    await this.claimControl.assertControls(weldList, data.userId);

    const by = em.getReference(UserEntity, data.userId);
    const filler =
      data.fillerMaterialId !== undefined
        ? em.getReference(FillerMaterialEntity, data.fillerMaterialId)
        : undefined;
    const wps =
      data.wpsId !== undefined
        ? em.getReference(WpsEntity, data.wpsId)
        : undefined;

    switch (data.status) {
      case WeldStatus.DONE:
        weld.complete(filler, wps, by, data.notes);
        break;
      default:
        throw new ConflictException(
          `Invalid status transition: ${weld.status} -> ${data.status}`,
        );
    }

    await em.flush();
    return this.welds.loadDetail(data.id);
  }
}
