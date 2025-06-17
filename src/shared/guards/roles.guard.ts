import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator'; // Import the key
import { Role, User } from '@prisma/client'; // Import Role enum and User type

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Get required roles from the route handler metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      // If no roles are specified, allow access (or disallow by default, depending on policy)
      return true;
    }

    // 2. Get the authenticated user from the request (populated by JwtStrategy)
    const { user } = context.switchToHttp().getRequest<{ user: User }>();

    if (!user) {
      // This case should ideally be handled by AuthGuard('jwt') already,
      // but it's a good safety check.
      return false; // No user authenticated
    }

    // 3. Check if the user's role matches any of the required roles
    // If the user's role is ADMIN, they can access any role-protected route (common practice)
    if (user.role === Role.ADMIN) {
        return true;
    }

    return requiredRoles.some((role) => user.role === role);
  }
}