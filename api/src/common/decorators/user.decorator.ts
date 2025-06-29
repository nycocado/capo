import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '@shared/types';

export const User = createParamDecorator(
  (
    property: keyof RequestWithUser['user'] | undefined,
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    return property ? user[property] : user;
  },
);
