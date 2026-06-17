import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "@modules/user";
import { UserEntity } from "@modules/user/entities";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Valida as credenciais e emite o JWT de sessão.
   *
   * @param internalId Identificador interno do utilizador (login)
   * @param password Palavra-passe em claro a verificar
   * @returns O token assinado e o utilizador autenticado (com papéis)
   * @throws UnauthorizedException Se as credenciais forem inválidas
   */
  async login(
    internalId: string,
    password: string,
  ): Promise<{ accessToken: string; user: UserEntity }> {
    const user = await this.userService.getByInternalId(internalId);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const accessToken = this.jwtService.sign({
      sub: user.id,
      internalId: user.internalId,
    });
    const authenticated = await this.userService.findOneWithRolesById(user.id);

    return { accessToken, user: authenticated };
  }
}
