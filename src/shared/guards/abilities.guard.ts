import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppAbility, CaslAbilityFactory } from '../../casl/casl-ability.factory';
import { CHECK_ABILITY, PolicyHandler } from '../decorators/abilities.decorator';
import { User } from '@prisma/client'; // Import User type

// Note on AbilitiesGuard: This guard will usually be chained after AuthGuard('jwt'). 
// The AuthGuard handles authentication (is the user who they say they are?), and 
// then AbilitiesGuard handles authorization (can this user do what they're trying to do?).
@Injectable()
export class AbilitiesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Get required policies (ability handlers) from route metadata
    const policyHandlers =
      this.reflector.get<PolicyHandler[]>(CHECK_ABILITY, context.getHandler()) || [];

    // 2. Get the authenticated user from the request (populated by JWTGuard)
    const request = context.switchToHttp().getRequest();
    const user: User = request.user; // Assuming req.user is populated by JwtAuthGuard

    if (!user) {
      throw new ForbiddenException('User not authenticated for this action.');
    }

    // 3. Create an Ability instance for the current user
    const ability = this.caslAbilityFactory.createForUser(user);

    // 4. Evaluate each policy handler against the user's ability
    const isAuthorized = policyHandlers.every((handler) => {
      if (typeof handler === 'function') {
        return handler(ability); // Execute function-based policy
      }
      // If it's an object, it means it implements IPolicyHandler
      return handler.handle(ability); // Execute handler method
    });

    if (!isAuthorized) {
      throw new ForbiddenException('You do not have the required permissions to perform this action.');
    }

    return true;
  }
}