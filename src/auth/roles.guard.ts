import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      // If no roles are required, allow access
      if (!requiredRoles) {
        console.log('No roles required for this route');
        return true;
      }

      const request = context.switchToHttp().getRequest();
      console.log('Full request object:', {
        headers: request.headers,
        url: request.url,
        method: request.method,
        user: request.user
      });

      // Check if user exists in request
      if (!request.user) {
        console.log('No user object in request');
        throw new ForbiddenException('No user found in request');
      }

      // Check if user has role property
      if (!request.user.role) {
        console.log('No role property in user object:', request.user);
        throw new ForbiddenException('No role found for user');
      }

      const userRole = request.user.role;
      console.log('User role:', userRole);
      console.log('Required roles:', requiredRoles);

      // Check if user's role is in the required roles
      const hasRole = requiredRoles.includes(userRole);
      console.log(`Role check result: ${userRole} in [${requiredRoles.join(', ')}] = ${hasRole}`);

      return hasRole;
    } catch (error) {
      console.error('Role guard error:', error);
      throw error;
    }
  }
} 