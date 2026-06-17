import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PipeLengthRepository } from "@modules/pipe-length/pipe-length.repository";
import {
  PipeLengthEntity,
  PipeLengthStatus,
  PipeLengthStatusEventEntity,
} from "@modules/pipe-length/entities";
import { CreatePipeLengthStatusEventDto } from "@modules/pipe-length/dto";
import { CutListService } from "@modules/cut-list";

// Máquina de estados do corte: to_do → in_progress (exige heat_number) → done.
const TRANSITIONS: Record<PipeLengthStatus, PipeLengthStatus[]> = {
  [PipeLengthStatus.TO_DO]: [PipeLengthStatus.IN_PROGRESS],
  [PipeLengthStatus.IN_PROGRESS]: [PipeLengthStatus.DONE],
  [PipeLengthStatus.DONE]: [],
};

@Injectable()
export class PipeLengthService {
  constructor(
    private readonly pipeLengthRepository: PipeLengthRepository,
    private readonly cutListService: CutListService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getById(id: number): Promise<PipeLengthEntity> {
    return this.pipeLengthRepository.findFullByIdOrFail(id);
  }

  async getStatusEvents(id: number): Promise<PipeLengthStatusEventEntity[]> {
    await this.pipeLengthRepository.findByIdOrFail(id);
    return this.pipeLengthRepository.findStatusEvents(id);
  }

  async createStatusEvent(
    id: number,
    dto: CreatePipeLengthStatusEventDto,
    userId: number,
  ): Promise<PipeLengthEntity> {
    const pipeLength = await this.pipeLengthRepository.findByIdOrFail(id);

    // Lock: só o claimer da cut_list (ou admin) avança os itens.
    await this.cutListService.assertCanAdvancePipeLength(id, userId);

    this.assertTransition(pipeLength.status, dto.status);

    if (
      dto.status === PipeLengthStatus.IN_PROGRESS &&
      !dto.heatNumber &&
      !pipeLength.heatNumber
    ) {
      throw new BadRequestException("heatNumber is required to start cutting");
    }

    const updated = await this.pipeLengthRepository.applyStatusEvent(
      pipeLength,
      dto.status,
      userId,
      dto.heatNumber,
      dto.notes,
    );

    this.eventEmitter.emit("pipe-length.statusChanged", updated, userId);
    return updated;
  }

  private assertTransition(
    current: PipeLengthStatus,
    next: PipeLengthStatus,
  ): void {
    if (!TRANSITIONS[current].includes(next)) {
      throw new ConflictException(
        `Invalid status transition: ${current} -> ${next}`,
      );
    }
  }
}
