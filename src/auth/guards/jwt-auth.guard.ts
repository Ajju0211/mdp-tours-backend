import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { BaseException } from '../../common/exceptions/base.exception';
import { InvalidTokenException } from '../admin/exceptions/auth.exception';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

/**
 * Guard responsible for protecting routes via JSON Web Tokens (JWT).
 * It intercepts requests, extracts the JWT from cookies or headers, 
 * verifies its authenticity, and attaches the decoded user payload to the request.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  /**
   * Evaluates the execution context to determine if a valid JWT is present.
   * 
   * @param context - The execution context containing the HTTP request
   * @throws InvalidTokenException if the token is missing, invalid, or expired
   * @returns boolean indicating whether the request should proceed
   */
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const token =
      request.cookies['access_token'] ||
      request.headers['authorization']?.split(' ')[1];

    if (!token) throw new InvalidTokenException('No token provided');

    try {
      const payload = this.jwtService.verify(token);
      (request as any).user = payload;
      return true;
    } catch {
      throw new InvalidTokenException();
    }
  }
}
