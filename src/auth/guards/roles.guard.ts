import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get roles defined on route via decorator
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true; // no roles defined → allow access

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // User must have at least one required role
    return requiredRoles.some(role => user.roles?.includes(role));
  }
}