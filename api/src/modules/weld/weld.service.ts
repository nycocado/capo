import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { WeldRepository } from "@modules/weld/weld.repository";
import {
  WeldEntity,
  WeldStatus,
  WeldStatusEventEntity,
} from "@modules/weld/entities";
import { CreateWeldStatusEventDto } from "@modules/weld/dto";
import { WeldListService } from "@modules/weld-list";

// Máquina de estados da solda: to_do → done.
const TRANSITIONS: Record<WeldStatus, WeldStatus[]> = {
  [WeldStatus.TO_DO]: [WeldStatus.DONE],
  [WeldStatus.DONE]: [],
};

@Injectable()
export class WeldService {
  constructor(
    private readonly weldRepository: WeldRepository,
    private readonly weldListService: WeldListService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getById(id: number): Promise<WeldEntity> {
    return this.weldRepository.findFullByIdOrFail(id);
  }

  async getStatusEvents(id: number): Promise<WeldStatusEventEntity[]> {
    await this.weldRepository.findByIdOrFail(id);
    return this.weldRepository.findStatusEvents(id);
  }

  async createStatusEvent(
    id: number,
    dto: CreateWeldStatusEventDto,
    userId: number,
  ): Promise<WeldEntity> {
    const weld = await this.weldRepository.findByIdOrFail(id);

    // Lock: só o claimer da weld_list (ou admin) avança os itens.
    await this.weldListService.assertCanAdvanceWeld(id, userId);

    this.assertTransition(weld.status, dto.status);

    if (dto.status === WeldStatus.DONE) {
      if (
        !(dto.fillerMaterialId ?? weld.fillerMaterial) ||
        !(dto.wpsId ?? weld.wps)
      ) {
        throw new BadRequestException(
          "fillerMaterial and wps are required to finish a weld",
        );
      }
    }

    const updated = await this.weldRepository.applyStatusEvent(
      weld,
      dto.status,
      userId,
      dto.fillerMaterialId,
      dto.wpsId,
      dto.notes,
    );

    this.eventEmitter.emit("weld.statusChanged", updated, userId);
    return updated;
  }

  private assertTransition(current: WeldStatus, next: WeldStatus): void {
    if (!TRANSITIONS[current].includes(next)) {
      throw new ConflictException(
        `Invalid status transition: ${current} -> ${next}`,
      );
    }
  }
}
