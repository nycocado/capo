import { Injectable } from '@nestjs/common';
import { FillerMaterialEntity } from '@modules/filler-material/entities';
import { FillerMaterialRepository } from '@modules/filler-material/filler-material.repository';

@Injectable()
export class FillerMaterialService {
  constructor(
    private readonly fillerMaterialRepository: FillerMaterialRepository,
  ) {}

  async getById(id: number): Promise<FillerMaterialEntity> {
    return this.fillerMaterialRepository.findByIdOrFail(id);
  }

  async getAll(): Promise<FillerMaterialEntity[]> {
    return this.fillerMaterialRepository.findAll();
  }
}
