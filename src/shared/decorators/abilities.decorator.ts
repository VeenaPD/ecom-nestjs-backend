import { SetMetadata } from '@nestjs/common';
import { Action } from '../enum/action.enum'; // Your Action enum
import { AppAbility } from '../../casl/casl-ability.factory'; // Your AppAbility type

// Define the structure of a rule required by the guard
export interface IPolicyHandler {
    handle(ability: AppAbility): boolean;
}

// A type that represents either a function (policy handler) or an ability tuple
export type PolicyHandler = IPolicyHandler | ((ability: AppAbility) => boolean);
export const CHECK_ABILITY = 'check_ability';

// Decorator to apply specific abilities required for a route
export const CheckAbilities = (...handlers: PolicyHandler[]) =>
    SetMetadata(CHECK_ABILITY, handlers);