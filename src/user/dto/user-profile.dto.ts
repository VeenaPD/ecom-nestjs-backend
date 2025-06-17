import { IsString, IsOptional, IsPhoneNumber, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddressDto } from 'src/shared/dto/address.dto';

export class UserProfileDto {
  @ApiPropertyOptional({ description: 'A short biography of the user', example: 'Passionate developer and avid reader.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'User contact phone number', example: '+12345678901' })
  @IsOptional()
  @IsString()
  // @IsPhoneNumber('US') // Can specify a region if needed, e.g., 'US' for US phone numbers
  phoneNumber?: string; // Consider using a custom validator or a more specific library for robust phone number validation

  @ApiPropertyOptional({ description: 'The user\'s primary shipping address' })
  @IsOptional()
  @ValidateNested() // <-- IMPORTANT: Tell class-validator to validate this nested object
  @Type(() => AddressDto) // <-- IMPORTANT: Tell class-transformer to instantiate AddressDto
  shippingAddress?: AddressDto;
}