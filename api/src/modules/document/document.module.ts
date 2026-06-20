import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { UserRoleModule } from "@modules/user-role/user-role.module";
import { DocumentController } from "@modules/document/document.controller";
import { GetDocumentHandler } from "@modules/document/application/handlers";

const imports = [CqrsModule, UserRoleModule];

const controllers = [DocumentController];

const providers = [GetDocumentHandler];

@Module({ imports, controllers, providers })
export class DocumentModule {}
