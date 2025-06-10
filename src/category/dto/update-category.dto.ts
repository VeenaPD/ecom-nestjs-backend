import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(3, { message: 'Category name must be at least 3 characters long' })
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}