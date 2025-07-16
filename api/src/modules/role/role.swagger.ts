import { applyDecorators } from "@nestjs/common";
import {
  ApiCookieAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { RoleEntity } from "@modules/role/entities";

export const ApiMyRoles = () =>
  applyDecorators(
    ApiCookieAuth(),
    ApiOperation({
      summary: "Get user roles",
      description: "Retrieves the roles assigned to the authenticated user.",
    }),
    ApiOkResponse({
      type: RoleEntity,
      description: "Roles retrieved successfully",
    }),
    ApiHeader({
      name: "Cookie",
      description: "Authentication token cookie",
      required: true,
      schema: {
        type: "string",
        example: "token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    }),
    ApiUnauthorizedResponse({ description: "Unauthorized access." }),
  );
