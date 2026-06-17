import { applyDecorators } from "@nestjs/common";
import {
  ApiBody,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { LoginRequestDto } from "./dto/login-request.dto";

export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({
      summary: "User login",
      description:
        "Validates credentials, sets the httpOnly session cookie and returns the authenticated user with its roles.",
    }),
    ApiBody({ type: LoginRequestDto }),
    ApiOkResponse({ description: "Authenticated user (with roles)." }),
    ApiUnauthorizedResponse({ description: "Invalid credentials." }),
  );

export const ApiLogout = () =>
  applyDecorators(
    ApiCookieAuth(),
    ApiOperation({
      summary: "User logout",
      description: "Clears the httpOnly session cookie.",
    }),
    ApiNoContentResponse({ description: "Session cookie cleared." }),
    ApiUnauthorizedResponse({ description: "Unauthorized." }),
  );

export const ApiMe = () =>
  applyDecorators(
    ApiCookieAuth(),
    ApiOperation({
      summary: "Current user",
      description: "Returns the authenticated user with its roles.",
    }),
    ApiOkResponse({ description: "Authenticated user (with roles)." }),
    ApiUnauthorizedResponse({ description: "Unauthorized." }),
  );
