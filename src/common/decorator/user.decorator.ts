// auth/decorators/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: any }>();
    const user = request.user;
    return data ? user?.[data] : user; // returns full user or a specific property
  },
);