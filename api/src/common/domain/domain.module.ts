import { Module } from "@nestjs/common";
import { UserRoleModule } from "@modules/user-role/user-role.module";
import { ClaimControlPolicy } from "@common/domain/claim-control.policy";

/** Regras de domínio partilhadas pelos módulos (claim/gating/progress). */
@Module({
  imports: [UserRoleModule],
  providers: [ClaimControlPolicy],
  exports: [ClaimControlPolicy],
})
export class DomainModule {}
