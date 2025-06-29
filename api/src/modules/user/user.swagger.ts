import { applyDecorators } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { User } from '@common/decorators';

export const ApiMyUser = () =>
  applyDecorators(
    ApiCookieAuth(),
    ApiOperation({
      summary: 'Get user profile',
      description: "Retrieves the authenticated user's profile information.",
    }),
    ApiOkResponse({
      type: User,
      description: 'User profile retrieved successfully',
    }),
    ApiHeader({
      name: 'Cookie',
      description: 'Authentication token cookie',
      required: true,
      schema: {
        type: 'string',
        example: 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Unauthorized access.',
    }),
  );
