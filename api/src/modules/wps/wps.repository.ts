import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { WpsEntity } from '@modules/wps/entities';
import { EntityRepository } from '@mikro-orm/mariadb';

@Injectable()
export class WpsRepository {
  constructor(
    @InjectRepository(WpsEntity)
    private readonly wpsRepository: EntityRepository<WpsEntity>,
  ) {}

  async findById(id: number): Promise<WpsEntity | null> {
    return this.wpsRepository.findOne(id);
  }

  async findByIdOrFail(id: number): Promise<WpsEntity> {
    return this.wpsRepository.findOneOrFail(id);
  }

  async findAll(): Promise<WpsEntity[]> {
    return this.wpsRepository.findAll();
  }
}
