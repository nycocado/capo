import { ForbiddenException, Injectable } from "@nestjs/common";
import { UserRoleService } from "@modules/user-role/user-role.service";
import { Role } from "@shared/types";
import { Claimable } from "@common/domain/claimable";

@Injectable()
export class ClaimControlPolicy {
  constructor(private readonly userRoleService: UserRoleService) {}

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
