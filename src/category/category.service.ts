// src/category/category.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Category, User } from '@prisma/client';


@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) { }

    async createCategory(name: string, description?: string, userId?: string): Promise<Category> {
        // If userId is provided, connect to an existing user
        const data: any = { name, description };
        if (userId) {
            data.user = {
                connect: { id: userId }, // Connect to an existing user
            };
        }

        try {
            const category = await this.prisma.category.create({
                data: data,
            });
            console.log(`[CategoryService] Created category: ${category.name}`);
            return category;
        } catch (error) {
            console.error('[CategoryService] Failed to create category:', error.message);
            throw error;
        }
    }

    async findAllCategories(): Promise<Category[]> {
        return this.prisma.category.findMany();
    }

    async findCategoryById(id: string): Promise<Category | null> {
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }

    async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
        try {
            const category = await this.prisma.category.update({
                where: { id },
                data,
            });
            console.log(`[CategoryService] Updated category: ${category.name}`);
            return category;
        } catch (error) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
    }

    async deleteCategory(id: string): Promise<Category> {
        try {
            const category = await this.prisma.category.delete({
                where: { id },
            });
            console.log(`[CategoryService] Deleted category: ${category.name}`);
            return category;
        } catch (error) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
    }
    // src/category/category.service.ts (continued)

    // Find categories and include the user who created them
    async findAllCategoriesWithCreator(): Promise<(Category & { user: User })[]> {
        return this.prisma.category.findMany({
            include: { user: true }, // Include the related User data
        });
    }

    // Find a specific category and include its creator
    async findCategoryByIdWithCreator(id: string): Promise<(Category & { user: User }) | null> {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { user: true },
        });
        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }
        return category;
    }

    // Assign an existing category to a different user
    async assignCategoryToUser(categoryId: string, newUserId: string): Promise<Category> {
        try {
            return this.prisma.category.update({
                where: { id: categoryId },
                data: {
                    user: {
                        connect: { id: newUserId },
                    },
                },
            });
        } catch (error) {
            throw new NotFoundException(`Category ${categoryId} or User ${newUserId} not found`);
        }
    }
}