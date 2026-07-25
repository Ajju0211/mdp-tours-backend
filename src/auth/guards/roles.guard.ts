import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

/**
 * Guard responsible for enforcing Role-Based Access Control (RBAC).
 * Ensures that the authenticated user possesses the required roles 
 * to access a specific route or controller.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Determines if the current request is authorized based on user roles.
   * 
   * @param context - The execution context containing the request and handler metadata
   * @returns boolean indicating if access is granted
   */
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some(role => user.roles?.includes(role));
  }
}