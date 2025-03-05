import { Controller, Post, Body, Req, UseGuards, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminDto } from './dto/admin.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiBody({ type: AdminDto })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  async login(
    @Body() loginDto: AdminDto,
    @Res({ passthrough: true }) res: any,
  ) {
    const { internalId, password } = loginDto;
    const { accessToken } = await this.authService.login(internalId, password);

    res.cookie('token', accessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60 * 1000, // 8 hours
    });

    return { accessToken };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('validate')
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  validateToken(@Req() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.validateToken(token);
  }
}
