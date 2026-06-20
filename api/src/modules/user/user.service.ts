import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { UserEntity } from "@modules/user/entities/user.entity";
import { UserRepository } from "@modules/user/user.repository";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: UserRepository,
  ) {}

  async getById(id: number): Promise<UserEntity> {
    return this.userRepository.findOneOrFail({ id });
  }

  async getByInternalId(internalId: string): Promise<UserEntity> {
    return this.userRepository.findByInternalIdOrFail(internalId);
  }

  async findOneWithRolesById(id: number): Promise<UserEntity> {
    return this.userRepository.findWithRolesByIdOrFail(id);
  }
}
