import { Injectable } from "@nestjs/common";
import { RoleEntity } from "@modules/role/entities";
import { RoleRepository } from "@modules/role/role.repository";

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getById(id: number): Promise<RoleEntity> {
    return this.roleRepository.findByIdOrFail(id);
  }

  async getByName(name: string): Promise<RoleEntity> {
    return this.roleRepository.findByNameOrFail(name);
  }

  async getAllByUserId(userId: number): Promise<RoleEntity[]> {
    return this.roleRepository.findAllByUserId(userId);
  }
}
