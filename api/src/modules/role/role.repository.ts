import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { RoleEntity } from "@modules/role/entities";
import { EntityRepository } from "@mikro-orm/mariadb";

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: EntityRepository<RoleEntity>,
  ) {}

  async findById(id: number): Promise<RoleEntity | null> {
    return this.roleRepository.findOne(id);
  }

  async findByIdOrFail(id: number): Promise<RoleEntity> {
    return this.roleRepository.findOneOrFail(id);
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    return this.roleRepository.findOne({ name: name });
  }

  async findByNameOrFail(name: string): Promise<RoleEntity> {
    return this.roleRepository.findOneOrFail({ name: name });
  }

  async findAllByUserId(userId: number): Promise<RoleEntity[]> {
    return this.roleRepository.find({ users: { id: userId } });
  }
}
