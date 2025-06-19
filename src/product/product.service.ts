// src/product/product.service.ts (UPDATED)
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Product, Prisma } from '@prisma/client';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(
    createProductDto: CreateProductDto,
    authorId: string, // <-- Added authorId
  ): Promise<Product> {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        price: new Prisma.Decimal(createProductDto.price),
        authorId, // <-- Assign the authorId
      },
    });
  }

  async findAllProducts(): Promise<Product[]> {
    return this.prisma.product.findMany({ include: { category: true, author: true } });
  }

  async findProductById(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true, author: true },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found.`);
    }
    return product;
  }

  async updateProduct(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    try {
      return await this.prisma.product.update({
        where: { id },
        data: {
          ...updateProductDto,
          price: updateProductDto.price
            ? new Prisma.Decimal(updateProductDto.price)
            : undefined,
        },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found.`);
      }
      throw error;
    }
  }

  async deleteProduct(id: string): Promise<Product> {
    try {
      return await this.prisma.product.delete({
        where: { id },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found.`);
      }
      throw error;
    }
  }
}