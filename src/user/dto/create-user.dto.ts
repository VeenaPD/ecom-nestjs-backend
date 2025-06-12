// src/user/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { Role } from '@prisma/client'; // Import Role enum from Prisma client
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  // Example for strong password regex: at least one uppercase, one lowercase, one number, one special char
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|:;"'<>,.?/~`]).{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string; // This would typically be hashed in the service

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value) // Trim first/last name if string
  firstName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value) // Trim first/last name if string
  lastName?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Invalid user role' })
  role?: Role; // Default to USER in service if not provided
}