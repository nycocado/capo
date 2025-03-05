import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthEntity } from './entity/auth.entity';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async login(internalId: string, password: string) {
    const user = await this.databaseService.user.findUnique({
      where: {
        internalId: internalId,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = {
      internalId: user.internalId,
      sub: user.id,
    };

    return { accessToken: this.jwtService.sign(payload) };
  }

  async validateToken(token: string) {
    const decoded = this.jwtService.verify(token);
    const user = await this.databaseService.user.findUnique({
      where: {
        id: decoded.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return { accessToken: token };
  }
}
