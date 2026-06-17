import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@mikro-orm/nestjs";
import { UserEntity } from "@modules/user/entities";
import { EntityRepository } from "@mikro-orm/mariadb";

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: EntityRepository<UserEntity>,
  ) {}

  private readonly FULL_POPULATE_FIELDS = ["roles"] as const;

  async findById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne(id);
  }

  async findByIdOrFail(id: number): Promise<UserEntity> {
    return this.userRepository.findOneOrFail(id);
  }

  async findByInternalId(internalId: string): Promise<UserEntity | null> {
    return this.userRepository.findOne({ internalId });
  }

  async findByInternalIdOrFail(internalId: string): Promise<UserEntity> {
    return this.userRepository.findOneOrFail({ internalId });
  }

  async findWithRolesById(id: number): Promise<UserEntity | null> {
    return this.userRepository.findOne(
      { id: id },
      { populate: this.FULL_POPULATE_FIELDS },
    );
  }

  async findWithRolesByIdOrFail(id: number): Promise<UserEntity> {
    return this.userRepository.findOneOrFail(id, {
      populate: this.FULL_POPULATE_FIELDS,
    });
  }

  async findAll(): Promise<UserEntity[]> {
    return this.userRepository.findAll();
  }
}
