import { Injectable } from '@nestjs/common';
import { FittingEntity } from '@modules/fitting/entities';
import { FittingRepository } from '@modules/fitting/fitting.repository';

@Injectable()
export class FittingService {
  constructor(private readonly fittingRepository: FittingRepository) {}

  async getById(id: number): Promise<FittingEntity> {
    return this.fittingRepository.findFullByIdOrFail(id);
  }

  async getAll(): Promise<FittingEntity[]> {
    return this.fittingRepository.findFullAll();
  }
}
