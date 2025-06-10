// src/user/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service'; // Inject PrismaService
import { User, Role, Category } from '@prisma/client'; // Import generated types from Prisma Client

@Injectable()
export class UserService {    
    constructor(private prisma: PrismaService) { } // Inject PrismaService

    async createUser(email: string, passwordHash: string, firstName?: string, lastName?: string, role: Role = Role.USER): Promise<User> {
        try {
            const user = await this.prisma.user.create({
                data: {
                    email,
                    password: passwordHash,
                    firstName,
                    lastName,
                    role,
                },
            });
            console.log(`[UserService] Created user: ${user.email}`);
            return user;
        } catch (error) {
            // Handle unique constraint violation, etc.
            console.error('[UserService] Failed to create user:', error.message);
            throw error;
        }
    }

    async findAllUsers(): Promise<User[]> {
        return this.prisma.user.findMany();
    }

    async findUserById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
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