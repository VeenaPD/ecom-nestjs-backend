// src/user/user.service.ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service'; // Inject PrismaService
import { User, Role, Category } from '@prisma/client'; // Import generated types from Prisma Client
import * as bcrypt from 'bcryptjs';
@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { } // Inject PrismaService

    // async createUser(email: string, passwordHash: string, firstName?: string, lastName?: string, role: Role = Role.USER): Promise<User> {
    //     try {
    //         const user = await this.prisma.user.create({
    //             data: {
    //                 email,
    //                 password: passwordHash,
    //                 firstName,
    //                 lastName,
    //                 role,
    //             },
    //         });
    //         console.log(`[UserService] Created user: ${user.email}`);
    //         return user;
    //     } catch (error) {
    //         // Handle unique constraint violation, etc.
    //         console.error('[UserService] Failed to create user:', error.message);
    //         throw error;
    //     }
    // }

    // NEW/UPDATED method for User Registration
    async registerUser(
        email: string,
        passwordPlain: string, // Plain text password from DTO
        firstName?: string,
        lastName?: string,
        role: Role = Role.USER, // Default role to USER
    ): Promise<User> {
        // 1. Check if user with this email already exists
        const existingUser = await this.findUserByEmail(email);
        if (existingUser) {
            throw new ConflictException(`User with email "${email}" already exists.`);
        }

        // 2. Hash the password
        const salt = await bcrypt.genSalt(10); // Generate a salt
        const passwordHash = await bcrypt.hash(passwordPlain, salt); // Hash the password

        // 3. Create the user in the database
        try {
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: passwordHash, // Store the hashed password
                    firstName,
                    lastName,
                    role,
                },
            });
            console.log(`[UserService] Registered new user: ${user.email}`);
            // ... return user (maybe without password for response)
            const { password, ...result } = user;
            return result as User;
        } catch (error) {
            // Catch potential database errors (e.g., unique constraint violations, though we checked above)
            console.error('[UserService] Failed to register user:', error.message);
            throw error;
        }
    }


    // Example: Validate password during login (not part of registration, but useful)
    async validatePassword(plainPassword: string, hashedPasswordFromDb: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPasswordFromDb);
    }

    async findAllUsers(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    // IMPORTANT: This method must return the user object *including the hashed password*
    // for AuthService to perform password comparison. Prisma does this by default.
    async findUserByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        return user;
    }

    // IMPORTANT: This method also returns the full User object, including password.
    // It's used by JwtStrategy to validate the user from the JWT payload.
    async findUserById(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async updateUser(id: string, data: Partial<User>): Promise<User> {
        try {
            const user = await this.prisma.user.update({
                where: { id },
                data,
            });
            console.log(`[UserService] Updated user: ${user.email}`);
            return user;
        } catch (error) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    async deleteUser(id: string): Promise<User> {
        try {
            const user = await this.prisma.user.delete({
                where: { id },
            });
            console.log(`[UserService] Deleted user: ${user.email}`);
            return user;
        } catch (error) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
    }

    // src/user/user.service.ts (continued)

    // Create a user and connect them to existing categories
    async createUserWithCategories(email: string, passwordHash: string, categoryIds: string[]): Promise<User & { categories: Category[] }> {
        return this.prisma.user.create({
            data: {
                email,
                password: passwordHash,
                role: Role.USER,
                categories: {
                    connect: categoryIds.map(id => ({ id })), // Connect to existing categories by ID
                },
            },
            // Include categories in the response to verify the relationship
            include: { categories: true },
        });
    }

    // Find a user and include their associated categories
    async findUserWithCategories(userId: string): Promise<(User & { categories: Category[] }) | null> {
        return this.prisma.user.findUnique({
            where: { id: userId },
            include: { categories: true }, // Include the related categories
        });
    }

    // Find all users and only select specific fields and their categories' names
    async findAllUsersWithCategoryNames(): Promise<
        { id: string; email: string; categories: { name: string }[] }[]
    > {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                categories: {
                    select: {
                        name: true,
                    },
                },
            },
        });
    }
}