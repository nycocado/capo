import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { UserEntity } from "@modules/user/entities";
import { UserService } from "@modules/user/user.service";
import { UserRepository } from "@modules/user/user.repository";

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity])],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
