import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

// PartialType from @nestjs/mapped-types can be used for more complex updates
// import { PartialType } from '@nestjs/mapped-types';
// export class UpdateUserDto extends PartialType(CreateUserDto) {}
export class UpdateUserDto {
  @IsOptional()
  @IsEmail({}, { message: 'Invalid email format' })
  email?: string;

  // @IsOptional()
  // @IsString()
  // @MinLength(8, { message: 'Password must be at least 8 characters long' })
  // password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Invalid user role' })
  role?: Role;
}