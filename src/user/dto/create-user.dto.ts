// src/user/dto/create-user.dto.ts
import { IsEmail, IsString, MinLength, IsEnum, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'; // Import Swagger decorators
import { Role } from '@prisma/client'; // Import Role enum from Prisma client
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @Transform(({ value }) => value.trim().toLowerCase())
  email: string;


  @ApiProperty({
    description: 'The user password (min 8 characters, with complexity rules)',
    example: 'MyStrongP@ssw0rd!',
    minLength: 8,
    // Note: 'format' is not typically used for password content complexity
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  // Example for strong password regex: at least one uppercase, one lowercase, one number, one special char
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|:;"'<>,.?/~`]).{8,}$/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string; // This would typically be hashed in the service


  @ApiPropertyOptional({ description: 'The first name of the user', example: 'John' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value) // Trim first/last name if string
  firstName?: string;


  @ApiPropertyOptional({ description: 'The last name of the user', example: 'Doe' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value) // Trim first/last name if string
  lastName?: string;


  @ApiPropertyOptional({
    description: 'The role of the user (USER or ADMIN)',
    example: Role.USER,
    enum: Role, // For enum dropdown in Swagger
    default: Role.USER,
  })
  @IsOptional()
  @IsEnum(Role, { message: 'Invalid user role' })
  role?: Role; // Default to USER in service if not provided
}
