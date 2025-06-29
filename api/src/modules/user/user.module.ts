import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { UserEntity } from '@modules/user/entities';
import { UserRoleModule } from '@modules/user-role';
import { UserController } from '@modules/user/user.controller';
import { UserService } from '@modules/user/user.service';
import { UserRepository } from '@modules/user/user.repository';

@Module({
  imports: [MikroOrmModule.forFeature([UserEntity]), UserRoleModule],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],
})
export class UserModule {}
