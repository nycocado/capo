import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PipeLengthEntity } from '@modules/pipe-length/entities';
import { WorkStatusType } from '@database/entities';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PipeLengthRepository } from '@modules/pipe-length/pipe-length.repository';

@Injectable()
export class PipeLengthService {
  constructor(
    private readonly pipeLengthRepository: PipeLengthRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getById(id: number): Promise<PipeLengthEntity> {
    return this.pipeLengthRepository.findFullByIdOrFail(id);
  }

  async getAll(): Promise<PipeLengthEntity[]> {
    return this.pipeLengthRepository.findFullAll();
  }

  async updateWorkStatusToWorking(
    pipeLength: PipeLengthEntity,
    userId: number,
    heatNumber?: string,
    notes?: string,
  ): Promise<PipeLengthEntity> {
    if (!heatNumber) {
      throw new BadRequestException();
    }

    return this.pipeLengthRepository.updateWorkStatusToWorking(
      pipeLength,
      userId,
      heatNumber,
      notes,
    );
  }

  async updateWorkStatusToFinished(
    pipeLength: PipeLengthEntity,
    userId: number,
    notes?: string,
  ): Promise<PipeLengthEntity> {
    const newPipeLength =
      await this.pipeLengthRepository.updateWorkStatusToFinished(
        pipeLength,
        userId,
        notes,
      );

    this.eventEmitter.emit(
      'pipe-length.updateWorkStatusToFinished',
      newPipeLength,
      userId,
    );

    return newPipeLength;
  }

  async updateWorkStatus(
    id: number,
    userId: number,
    heatNumber?: string,
    notes?: string,
  ): Promise<PipeLengthEntity> {
    const pipeLength =
      await this.pipeLengthRepository.findWithWorkStatusesByIdOrFail(id);

    const workStatuses = pipeLength.part.workStatuses;
    const currentWorkStatus = workStatuses[workStatuses.length - 1];

    switch (currentWorkStatus?.workStatusType.name) {
      case WorkStatusType.TO_DO: {
        return this.updateWorkStatusToWorking(
          pipeLength,
          userId,
          heatNumber,
          notes,
        );
      }
      case WorkStatusType.WORKING: {
        return this.updateWorkStatusToFinished(pipeLength, userId, notes);
      }
      case WorkStatusType.FINISHED: {
        return this.pipeLengthRepository.populateToFull(pipeLength);
      }
      default: {
        throw new InternalServerErrorException();
      }
    }
  }

  async updateHeatNumber(
    id: number,
    heatNumber: string,
  ): Promise<PipeLengthEntity> {
    if (!heatNumber) {
      throw new BadRequestException();
    }

    const pipeLength = await this.getById(id);
    return this.pipeLengthRepository.updateHeatNumber(pipeLength, heatNumber);
  }
}
