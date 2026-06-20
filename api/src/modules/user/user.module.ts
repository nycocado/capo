import { Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { UserEntity } from "@modules/user/entities/user.entity";
import { UserService } from "@modules/user/user.service";

const imports = [MikroOrmModule.forFeature([UserEntity])];

const providers = [UserService];

@Module({ imports, providers, exports: [UserService] })
export class UserModule {}
