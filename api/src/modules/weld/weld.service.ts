import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { WeldEntity } from '@modules/weld/entities';
import { WorkStatusType } from '@database/entities';
import { WeldRepository } from '@modules/weld/weld.repository';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class WeldService {
  constructor(
    private readonly weldRepository: WeldRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async getById(id: number): Promise<WeldEntity> {
    return this.weldRepository.findFullByIdOrFail(id);
  }

  async getAll(): Promise<WeldEntity[]> {
    return this.weldRepository.findFullAll();
  }

  async updateWorkStatusToFinished(
    weld: WeldEntity,
    userId: number,
    fillerMaterial?: string,
    wps?: string,
    notes?: string,
  ): Promise<WeldEntity> {
    if (!fillerMaterial || !wps) {
      throw new BadRequestException();
    }

    const newWeld = await this.weldRepository.updateWorkStatusToFinished(
      weld,
      userId,
      fillerMaterial,
      wps,
      notes,
    );

    this.eventEmitter.emit('weld.updateWorkStatusToFinished', newWeld, userId);

    return newWeld;
  }

  async updateWorkStatus(
    id: number,
    userId: number,
    fillerMaterial?: string,
    wps?: string,
    notes?: string,
  ): Promise<WeldEntity> {
    const weld = await this.weldRepository.findWithWorkStatusesByIdOrFail(id);

    const currentWorkStatus = weld.workStatuses[weld.workStatuses.length - 1];

    switch (currentWorkStatus?.workStatusType.name) {
      case WorkStatusType.TO_DO: {
        return this.updateWorkStatusToFinished(
          weld,
          userId,
          fillerMaterial,
          wps,
          notes,
        );
      }
      case WorkStatusType.FINISHED: {
        return this.weldRepository.populateToFull(weld);
      }
      default: {
        throw new InternalServerErrorException();
      }
    }
  }

  async updateFillerMaterial(
    id: number,
    fillerMaterial?: string,
  ): Promise<WeldEntity> {
    if (!fillerMaterial) {
      throw new BadRequestException();
    }

    const weld = await this.weldRepository.findByIdOrFail(id);
    return this.weldRepository.updateFillerMaterial(weld, fillerMaterial);
  }

  async updateWps(id: number, wps?: string): Promise<WeldEntity> {
    if (!wps) {
      throw new BadRequestException();
    }

    const weld = await this.weldRepository.findByIdOrFail(id);
    return this.weldRepository.updateWps(weld, wps);
  }
}
