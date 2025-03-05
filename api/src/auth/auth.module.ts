import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from '../database/database.module';
import { UserModule } from '../user/user.module';
import { JwtStrategy } from './jwt.strategy';
import { PipeLengthModule } from '../pipe-length/pipe-length.module';

export const jwtSecret = process.env.JWT_SECRET;

@Module({
  imports: [
    DatabaseModule,
    PipeLengthModule,
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '8h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
