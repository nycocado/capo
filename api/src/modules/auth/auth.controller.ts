import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { UserRoleService } from '@modules/user-role';
import { AuthService } from '@modules/auth/auth.service';
import { ConfigService } from '@nestjs/config';
import {
  ApiHasRole,
  ApiLogin,
  ApiValidateToken,
} from '@modules/auth/auth.swagger';
import {
  HasRoleResponseDto,
  LoginRequestDto,
  LoginResponseDto,
  ValidateResponseDto,
} from '@modules/auth/dto';
import { JwtCookieAuthGuard } from '@common/guards';
import { Request } from 'express';
import { User } from '@common/decorators';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly userRoleService: UserRoleService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  @ApiLogin()
  async login(
    @Body() loginDto: LoginRequestDto,
    @Res({ passthrough: true }) res: any,
  ): Promise<LoginResponseDto> {
    const { internalId, password } = loginDto;
    const accessToken = await this.authService.login(internalId, password);
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000,
    });

    return {
      accessToken: isProduction ? undefined : accessToken,
    };
  }

  @UseGuards(JwtCookieAuthGuard)
  @Get('validate')
  @ApiValidateToken()
  async validateToken(@Req() req: Request): Promise<ValidateResponseDto> {
    const isProduction = this.configService.get('NODE_ENV') !== 'production';
    const token: string = isProduction ? req.cookies['token'] : null;

    return {
      token: token,
      valid: !!token,
    };
  }

  @UseGuards(JwtCookieAuthGuard)
  @Get('has-role/:role')
  @ApiHasRole()
  async hasRole(
    @Param('role') role: string,
    @User('id') userId: number,
  ): Promise<HasRoleResponseDto> {
    const hasRole = await this.userRoleService.hasRole(userId, role);

    return {
      hasRole: hasRole,
    };
  }
}
