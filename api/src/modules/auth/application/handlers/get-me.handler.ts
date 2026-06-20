import { IQueryHandler, QueryHandler } from "@nestjs/cqrs";
import { UserService } from "@modules/user/user.service";
import { UserEntity } from "@modules/user/entities/user.entity";
import { GetMeQuery } from "@modules/auth/application/queries";

@QueryHandler(GetMeQuery)
export class GetMeHandler implements IQueryHandler<GetMeQuery> {
  constructor(private readonly userService: UserService) {}

  execute({ data }: GetMeQuery): Promise<UserEntity> {
    return this.userService.findOneWithRolesById(data.userId);
  }
}
