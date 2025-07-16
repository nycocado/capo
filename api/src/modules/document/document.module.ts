import { Module } from "@nestjs/common";
import { DocumentService } from "./document.service";
import { DocumentController } from "./document.controller";
import { UserRoleModule } from "@modules/user-role";

@Module({
  imports: [UserRoleModule],
  controllers: [DocumentController],
  providers: [DocumentService],
})
export class DocumentModule {}
