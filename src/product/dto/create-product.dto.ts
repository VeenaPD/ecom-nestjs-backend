// src/product/dto/create-product.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ description: 'The name of the product', example: 'Gaming Laptop' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'A detailed description of the product', example: 'High-performance laptop for gaming.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The price of the product', example: 1200.50 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number; // Price should be a number in DTO, converted to Decimal for Prisma

  @ApiProperty({ description: 'The current stock quantity of the product', example: 50 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  stock: number;

  @ApiProperty({ description: 'URL to the product image', example: 'http://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'The ID of the category this product belongs to', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  categoryId: string; // Foreign key for Category
}