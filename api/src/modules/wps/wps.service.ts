import { Injectable } from "@nestjs/common";
import { WpsEntity } from "@modules/wps/entities";
import { WpsRepository } from "@modules/wps/wps.repository";

@Injectable()
export class WpsService {
  constructor(private readonly wpsRepository: WpsRepository) {}

  async findOne(id: number): Promise<WpsEntity> {
    return this.wpsRepository.findByIdOrFail(id);
  }

  async findAll(): Promise<WpsEntity[]> {
    return this.wpsRepository.findAll();
  }
}
