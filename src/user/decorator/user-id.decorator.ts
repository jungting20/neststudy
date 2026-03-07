import {
  createParamDecorator,
  ExecutionContext,
  // UnauthorizedException,
} from '@nestjs/common';

export const UserId = createParamDecorator(
  (data, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request?.user?.sub;
  },
);
