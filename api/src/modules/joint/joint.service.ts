import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { JointEntity } from "@modules/joint/entities";
import { WorkStatusType } from "@database/entities";
import { JointRepository } from "@modules/joint/joint.repository";
import { EventEmitter2 } from "@nestjs/event-emitter";

@Injectable()
export class JointService {
  constructor(
    private readonly jointRepository: JointRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getById(id: number): Promise<JointEntity> {
    return this.jointRepository.findFullByIdOrFail(id);
  }

  async getAll(): Promise<JointEntity[]> {
    return this.jointRepository.findFullAll();
  }

  async updateWorkStatusToFinished(
    joint: JointEntity,
    userId: number,
    notes?: string,
  ): Promise<JointEntity> {
    const newJoint = await this.jointRepository.updateWorkStatusToFinished(
      joint,
      userId,
      notes,
    );

    this.eventEmitter.emit(
      "joint.updateWorkStatusToFinished",
      newJoint,
      userId,
    );

    return newJoint;
  }

  async updateWorkStatus(
    id: number,
    userId: number,
    notes?: string,
  ): Promise<JointEntity> {
    const joint = await this.jointRepository.findWithWorkStatusesByIdOrFail(id);

    const currentWorkStatus = joint.workStatuses[joint.workStatuses.length - 1];

    switch (currentWorkStatus?.workStatusType.name) {
      case WorkStatusType.TO_DO:
        return this.updateWorkStatusToFinished(joint, userId, notes);
      case WorkStatusType.FINISHED:
        return this.jointRepository.populateToFull(joint);
      default:
        throw new InternalServerErrorException();
    }
  }
}
