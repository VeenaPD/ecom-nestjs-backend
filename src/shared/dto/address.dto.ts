// src/common/dto/address.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsPostalCode, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddressDto {
  @ApiProperty({ description: 'Street address', example: '123 Main St' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ description: 'City', example: 'Springfield' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'State or Province', example: 'IL' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ description: 'Postal or ZIP code', example: '62701' })
  @IsString()
  @IsNotEmpty()
  @IsPostalCode('any', { message: 'Invalid postal code format' })
  postalCode: string;

  @ApiProperty({ description: 'Country', example: 'USA' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiPropertyOptional({ description: 'Apartment, suite, unit, etc.', example: 'Apt 4B' })
  @IsOptional()
  @IsString()
  apartment?: string;
}