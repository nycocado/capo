import { ConflictException, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { JointRepository } from "@modules/joint/joint.repository";
import {
  JointEntity,
  JointStatus,
  JointStatusEventEntity,
} from "@modules/joint/entities";
import { CreateJointStatusEventDto } from "@modules/joint/dto";
import { AssemblyListService } from "@modules/assembly-list";

// Máquina de estados da montagem: to_do → done.
const TRANSITIONS: Record<JointStatus, JointStatus[]> = {
  [JointStatus.TO_DO]: [JointStatus.DONE],
  [JointStatus.DONE]: [],
};

@Injectable()
export class JointService {
  constructor(
    private readonly jointRepository: JointRepository,
    private readonly assemblyListService: AssemblyListService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getById(id: number): Promise<JointEntity> {
    return this.jointRepository.findFullByIdOrFail(id);
  }

  async getStatusEvents(id: number): Promise<JointStatusEventEntity[]> {
    await this.jointRepository.findByIdOrFail(id);
    return this.jointRepository.findStatusEvents(id);
  }

  async createStatusEvent(
    id: number,
    dto: CreateJointStatusEventDto,
    userId: number,
  ): Promise<JointEntity> {
    const joint = await this.jointRepository.findByIdOrFail(id);

    // Lock: só o claimer da assembly_list (ou admin) avança os itens.
    await this.assemblyListService.assertCanAdvanceJoint(id, userId);

    this.assertTransition(joint.status, dto.status);

    const updated = await this.jointRepository.applyStatusEvent(
      joint,
      dto.status,
      userId,
      dto.notes,
    );

    this.eventEmitter.emit("joint.statusChanged", updated, userId);
    return updated;
  }

  private assertTransition(current: JointStatus, next: JointStatus): void {
    if (!TRANSITIONS[current].includes(next)) {
      throw new ConflictException(
        `Invalid status transition: ${current} -> ${next}`,
      );
    }
  }
}
