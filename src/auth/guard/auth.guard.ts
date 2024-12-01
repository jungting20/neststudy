import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Public } from '../decorater/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflctor: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflctor.get(Public, context.getHandler());

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    if (!request.user || request.user.type !== 'access') {
      return false;
    }

    return true;
  }
}
