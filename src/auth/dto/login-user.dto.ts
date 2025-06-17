import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
    @ApiProperty({ description: 'The email address of the user', example: 'test@example.com' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({ description: 'The user password', example: 'password123' })
    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    password: string;
}