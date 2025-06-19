import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, ExtractSubjectType, InferSubjects, PureAbility } from '@casl/ability';
import { User, Product, Category } from '@prisma/client'; // Import only the types
import { Action } from '../shared/enum/action.enum';

// Define the exact string literal names that will be used as subjects
type AppSubjectStrings = 'all' | 'User' | 'Product' | 'Category';

// InferSubjects will help if you ever work with actual class instances that
// match the Prisma types, but for now, the explicit strings are key.
// We combine them to ensure all possible subject types (strings or instances) are covered.
type Subjects = AppSubjectStrings | InferSubjects<User | Product | Category>;

export type AppAbility = PureAbility<[Action, Subjects]>;

// Define a simple custom conditions matcher
// This will perform basic equality checks on the conditions provided in your `can` rules.
const customConditionsMatcher = (conditions: any) => (object: any) => {
    if (!conditions) {
        return true; // No conditions means it always matches
    }

    for (const key in conditions) {
        // Ensure the property belongs to the conditions object itself, not its prototype chain
        if (Object.prototype.hasOwnProperty.call(conditions, key)) {
            // Perform a strict equality check
            if (object[key] !== conditions[key]) {
                return false; // Mismatch found
            }
        }
    }
    return true; // All conditions matched
};



@Injectable()
export class CaslAbilityFactory {
    createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility);

        if (user.role === 'ADMIN') {
            can(Action.Manage, 'all'); // Admin can manage all subjects (using string 'all')
        } else { // Regular 'USER' role
            // Users can read any User or Product or Category by their string names
            can(Action.Read, 'User');
            can(Action.Read, 'Product');
            can(Action.Read, 'Category');

            // Users can manage their OWN User profile (check against an instance's id)
            can(Action.Manage, 'User', { id: user.id });

            // Users can update their OWN products (check against an instance's authorId)
            can(Action.Update, 'Product', { authorId: user.id });

            // Users can delete their OWN products
            can(Action.Delete, 'Product', { authorId: user.id });
        }

        // return build({
        //   // This is crucial for instance-based checks (e.g., ability.can(Action.Update, productInstance))
        //   // It tells CASL how to get the subject type (e.g., 'Product') from a given object instance.
        //   detectSubjectType: (subject) =>
        //     subject.constructor as ExtractSubjectType<Subjects>,
        // });

        return build({
            // *** CRITICAL FIX HERE ***
            // `detectSubjectType` must return a string literal that matches `AppSubjectStrings`.
            detectSubjectType: (subject: object | string) => {
                if (typeof subject === 'string') {
                    // If the subject is already a string, return it directly.
                    // Cast to `AppSubjectStrings` to satisfy the return type.
                    return subject as AppSubjectStrings;
                }

                // If the subject is an object, determine its type based on distinguishing properties.
                // This is the most reliable way when working with plain objects from ORMs like Prisma.
                if ('email' in subject && 'password' in subject) {
                    return 'User'; // Return the string literal 'User'
                }
                if ('name' in subject && 'price' in subject && 'authorId' in subject) {
                    return 'Product'; // Return the string literal 'Product'
                }
                if ('name' in subject && 'description' in subject && 'userId' in subject) {
                    return 'Category'; // Return the string literal 'Category'
                }

                // Fallback for unidentifiable objects.
                // It is crucial to return one of the `AppSubjectStrings` here.
                // 'all' is a common and safe default if an object doesn't match a specific model.
                console.warn('CASL: Unknown subject type detected for object:', subject);
                return 'all'; // Default to 'all' or throw an error if strictness is required
            },
            conditionsMatcher: customConditionsMatcher,
        });
    }
}