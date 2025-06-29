import { Injectable } from '@nestjs/common';
import { UserEntity } from '@modules/user/entities';
import { UserRepository } from '@modules/user/user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getById(id: number): Promise<UserEntity> {
    return this.userRepository.findByIdOrFail(id);
  }

  async getByInternalId(internalId: string): Promise<UserEntity> {
    return this.userRepository.findByInternalIdOrFail(internalId);
  }

  async findOneWithRolesById(id: number): Promise<UserEntity> {
    return this.userRepository.findWithRolesByIdOrFail(id);
  }
}
