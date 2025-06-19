// src/product/dto/update-product.dto.ts
import { IsString, IsNumber, IsOptional, Min, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductDto {
    @ApiPropertyOptional({ description: 'The name of the product', example: 'Gaming Laptop Pro' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'A detailed description of the product', example: 'High-performance laptop for professional gaming.' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'The price of the product', example: 1250.75 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    price?: number; // Price should be a number in DTO

    @ApiPropertyOptional({ description: 'The current stock quantity of the product', example: 45 })
    @IsOptional()
    @IsNumber()
    @Min(0)
    stock?: number;

    @ApiPropertyOptional({ description: 'URL to the product image', example: 'http://example.com/new-image.jpg' })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiPropertyOptional({ description: 'The ID of the category this product belongs to', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
    @IsOptional()
    @IsString()
    @IsUUID()
    categoryId?: string;
}