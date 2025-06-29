import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCookieAuth,
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { LoginRequestDto } from './dto/login-request.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { ValidateResponseDto } from './dto/validate-response.dto';
import { HasRoleResponseDto } from './dto/has-role-response.dto';

export const ApiLogin = () =>
  applyDecorators(
    ApiOperation({
      summary: 'User login',
      description:
        'Authenticates user and returns token in development or sets HTTP-only cookie in production',
    }),
    ApiBody({ type: LoginRequestDto }),
    ApiOkResponse({
      type: LoginResponseDto,
      description: 'Login successful',
      example: {
        accessToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (development only)',
      },
      headers: {
        'Set-Cookie': {
          description: 'HTTP-only authentication cookie',
          schema: {
            type: 'string',
            example: 'token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...;',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({ description: 'Invalid credentials.' }),
  );

export const ApiValidateToken = () =>
  applyDecorators(
    ApiCookieAuth(),
    ApiOperation({
      summary: 'Validate authentication token',
      description: 'Validates the JWT token stored in the HTTP-only cookie.',
    }),
    ApiOkResponse({
      type: ValidateResponseDto,
      description: 'Token is valid',
      example: {
        valid: true,
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (development only)',
      },
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
    ApiUnauthorizedResponse({ description: 'Invalid Token.' }),
  );

export const ApiHasRole = () =>
  applyDecorators(
    ApiCookieAuth(),
    ApiOperation({
      summary: 'Has role',
      description: 'Checks if the authenticated user has a specific role.',
    }),
    ApiOkResponse({
      type: HasRoleResponseDto,
      description: 'Role check successful',
      example: {
        hasRole: true,
      },
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
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
