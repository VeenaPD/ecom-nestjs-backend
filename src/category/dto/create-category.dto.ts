import { IsString, IsOptional, IsUUID, MinLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(3, { message: 'Category name must be at least 3 characters long' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Invalid userId format' }) // Ensure userId is a UUID
  userId?: string; // Optional: creator of the category
}