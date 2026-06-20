import { ForbiddenException } from "@nestjs/common";
import { ClaimControlPolicy } from "@common/domain/claim-control.policy";
import { Claimable } from "@common/domain/claimable";
import type { UserRoleService } from "@modules/user-role/user-role.service";
import { Role } from "@shared/types";

describe("ClaimControlPolicy", () => {
  let policy: ClaimControlPolicy;
  let hasRole: jest.Mock;

  beforeEach(() => {
    hasRole = jest.fn();
    policy = new ClaimControlPolicy({
      hasRole,
    } as unknown as UserRoleService);
  });

  it("permite quando o utilizador é o claimer (sem consultar papéis)", async () => {
    const order: Claimable = { claimedBy: { id: 5 } };

    await expect(policy.assertControls(order, 5)).resolves.toBeUndefined();
    expect(hasRole).not.toHaveBeenCalled();
  });

  it("permite um administrador mesmo sem ser o claimer", async () => {
    hasRole.mockResolvedValue(true);
    const order: Claimable = { claimedBy: { id: 5 } };

    await expect(policy.assertControls(order, 99)).resolves.toBeUndefined();
    expect(hasRole).toHaveBeenCalledWith(99, Role.ADMINISTRATOR);
  });

  it("rejeita quem não é claimer nem admin com Forbidden", async () => {
    hasRole.mockResolvedValue(false);
    const order: Claimable = { claimedBy: { id: 5 } };

    await expect(policy.assertControls(order, 99)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it("rejeita quando a ordem não tem dono e o utilizador não é admin", async () => {
    hasRole.mockResolvedValue(false);
    const order: Claimable = {};

    await expect(policy.assertControls(order, 1)).rejects.toThrow(
      ForbiddenException,
    );
  });
});
