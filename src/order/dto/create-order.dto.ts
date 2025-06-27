import { IsNumber, IsString, IsUUID } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  status: string;

  @IsNumber()
  quantity: number;

  @IsUUID('4', { message: 'Invalid productId format' }) // Ensure productId is a UUID
  productId: string; // Optional: belongs to the order
}