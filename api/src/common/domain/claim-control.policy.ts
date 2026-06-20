import { ForbiddenException, Injectable } from "@nestjs/common";
import { UserRoleService } from "@modules/user-role/user-role.service";
import { Role } from "@shared/types";
import { Claimable } from "@common/domain/claimable";

/**
 * Regra cross-agregado do lock: só o claimer da ordem ou um administrador podem
 * avançar/libertar os seus itens. Cruza a ordem (estado do claim) com os papéis
 * do utilizador, por isso não cabe na entidade sozinha.
 */
@Injectable()
export class ClaimControlPolicy {
  constructor(private readonly userRoleService: UserRoleService) {}

  /**
   * @throws ForbiddenException Se o utilizador não for o claimer nem administrador
   */
  async assertControls(order: Claimable, userId: number): Promise<void> {
    if (order.claimedBy?.id === userId) {
      return;
    }
    if (await this.userRoleService.hasRole(userId, Role.ADMINISTRATOR)) {
      return;
    }
    throw new ForbiddenException("Order is not claimed by this user");
  }
}
