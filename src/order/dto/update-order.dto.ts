import { IsNumber, IsString, IsUUID } from 'class-validator';

export class UpdateOrderDto {
  @IsString()
  status: string;

  @IsNumber()
  quantity: number;

  @IsUUID('4', { message: 'Invalid productId format' }) // Ensure productId is a UUID
  productId: string; // Optional: belongs to the order

  @IsUUID('4', { message: 'Invalid userId format' }) // Ensure userId is a UUID
  userId: string; // Optional: creator of the order
}